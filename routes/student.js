const express = require("express");
const multer = require("multer");
const router = express.Router();

// MULTER Configuaration //

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
  destination: function (req, file, cb) {
    cb(null, "views/uploads");
  },
});

const upload = multer({ storage: storage }).array("files", 2);

// Controller Functions //

const { register, edit } = require("../controllers/student");

//middleware functions

const { protect, validateType } = require("../middlewares/auth");

// Routes for Students //
router.post(
  "/add-info",
  [protect, validateType("student")],
  function (req, res, next) {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        res
          .status(406)
          .json({ message: "Couldn't Upload profile picture, Upload again!" });
      } else if (err) {
        // An unknown error occurred when uploading.
        res
          .status(400)
          .json({ message: "Couldn't Upload profile picture, Upload again!" });
      }
      // Everything went fine.
      next();
    });
  },
  register
);

router.put("/edit-info", [protect, validateType("student")], edit);

module.exports = router;
