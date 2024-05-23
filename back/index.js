const express = require('express');
const multer  = require('multer')
const app = express();
const cors = require("cors");
const docxToPDF = require('docx-pdf');
const path = require('path');
const dotenv=require("dotenv");
const PORT=process.env.PORT || 8000;
dotenv.config()
app.use(cors());
const corsOptions = {
  origin: process.env.CORS_ORIGIN, 
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// storage setting start
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {

      cb(null,file.originalname)
    }
  })
  
  const upload = multer({ storage: storage });

  app.post('/convertFile', upload.single('file'), (req, res, next)=> {
    try
    {

        if(!req.file)
        {
            return res.status(400).json({
                message: "No file uploaded"
            })
        }
        //define output file path
        let outoutpath = path.join(__dirname,"files",`${req.file.originalname}.pdf`)
        docxToPDF(req.file.path,outoutpath,(err,result)=>{
            if(err){
              console.log(err);
              return res.status(500).json({
                message: "Error converting docx to pdf",
              });
            }
            res.download(outoutpath,()=>{
                console.log("file downloaded");
            })
          });
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }

  })
// storage setting end




app.get("/",(req,res)=>{
    res.send("hello world!");
})



app.listen (PORT , ()=>{
  console.log(`Server is running in ${PORT}`);
})

