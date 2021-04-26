const router = require("express").Router();

const { upload } = require("../middlewares/multer");

router.post("/fileUpload", upload, (req, res, next) => {
  if (req.files) {
    if (
      req.files.image[0].mimetype == "image/jpeg" ||
      req.files.image[0].mimetype == "image/jpg" ||
      req.files.image[0].mimetype == "image/png"
    ) {
      if (!(req.files.image[0].size <= 10485760)) {
        const error = new Error("Cannot upload file size greater than 10MB");
        error.status = 400;
        throw error;
      } else {
        res.status(200).json(req.files.image[0].path);

        UploadedPicture = {
          image: req.files.image[0].filename,
          status: "To be Validated",
        };
      }
    } else {
      res.status(400).send({
        message: "Please select an image of File type JPEG/JPG/PNG",
      });
      const error = new Error(
        "Please select an image of File type JPEG/JPG/PNG"
      );
      error.status = 400;
      throw error;
    }
  }
});

module.exports = router;
