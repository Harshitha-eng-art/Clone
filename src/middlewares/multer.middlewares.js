//middleware usinnng multer
//here multer is used to upload the file or vedio to perticular destination in the local web server

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './public/temp') //destination of the place where file should be uploaded
//     },
//     filename: function (req, file, cb) {
      
//       cb(null, file.originalname)
//     }
//   })
  
//   export const upload = multer({ storage });

import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp'); // Destination of the place where file should be uploaded
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, file.originalname)
    }
});

export const upload = multer({ storage ,});

export default upload;



 