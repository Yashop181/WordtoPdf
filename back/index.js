const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const docxToPDF = require('docx-pdf');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  optionSuccessStatus: 200,
}));

// Ensure upload and files directories exist
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const FILES_DIR = path.join(__dirname, 'files');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post('/convertFile', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const outputFilePath = path.join(FILES_DIR, `${req.file.filename.replace(/\.[^/.]+$/, '')}.pdf`);

    docxToPDF(req.file.path, outputFilePath, (err) => {
      if (err) {
        console.error('Error converting docx to pdf:', err);
        return res.status(500).json({ message: 'Error converting docx to pdf' });
      }

      res.download(outputFilePath, (downloadErr) => {
        if (downloadErr) {
          console.error('Error sending file:', downloadErr);
          return res.status(500).json({ message: 'Error sending file' });
        }

        // Clean up uploaded file and converted file after sending
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting uploaded file:', unlinkErr);
        });
        fs.unlink(outputFilePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting output file:', unlinkErr);
        });

        console.log('File converted and sent successfully.');
      });
    });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
