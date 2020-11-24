const express = require("express");
const multer = require("multer");
const User = require("../models/User");
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

const upload = multer({ storage: storage });

// Controller Functions //

const { 
    editStudent
} = require("../controllers/student");

//middleware functions

const {
  protect,
  authorize,
  validateType,
  dashboard,
} = require("../middlewares/auth");

// Routes for Students // 
router.post("/edit-profile",[protect,validateType("student")],editStudent);


module.exports = router;
