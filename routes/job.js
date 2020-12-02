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

const upload = multer({ storage: storage }).single([
  {
    name: "image",
    maxCount: 1,
  },
]);

// Controller Functions //

const { CreateJob } = require("../controllers/job");

//middleware functions

const { protect, validateType } = require("../middlewares/auth");

// Routes for Jobs //
router.post(
  "/create-job",
  [protect, validateType("company")],
  upload,
  CreateJob
);
module.exports = router;
