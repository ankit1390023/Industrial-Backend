import multer from 'multer';
import path from 'path'
const storage = multer.diskStorage({
    destination: function (req, file, cb) { //jha file store hoga 
        cb(null, './public/temp')  
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage })
export { upload };