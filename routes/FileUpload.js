const router = require("express").Router();

const { upload } = require("../middlewares/multer");

router.post("/fileUpload", upload, (req, res, next) => {
  if (req.files) {
    console.log(req.files, "req.files");
    res.status(200).json(req.files.image[0].path);
  }
});

module.exports = router;
