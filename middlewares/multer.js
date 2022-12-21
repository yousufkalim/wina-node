const multer = require("multer");
var maxSize = 104857600;

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/ /g, '_'));
  },
  destination: function (req, file, cb) {
    cb(null, 'views/uploads');
  }
});

exports.upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).fields([
  {
    name: "video",
    maxCount: 1,
  },
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "photo",
    maxCount: 1,
  },
  {
    name: "school_image",
    maxCount: 1,
  },
  {
    name: "resume",
    maxCount: 1,
  },
]);
