const multer = require("multer");
var maxSize = 1 * 1000 * 1000 * 10;

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
  destination: function (req, file, cb) {
    cb(null, "views/uploads");
  },
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
