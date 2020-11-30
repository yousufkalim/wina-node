const express = require("express");
const multer = require("multer");
const router = express.Router();

// MULTER Configuaration //
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "views/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// Controller Functions //

const { register } = require("../controllers/company");

// middleware functions //

//middleware functions

const { protect, validateType } = require("../middlewares/auth");

module.exports = router;
