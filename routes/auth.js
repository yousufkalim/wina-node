const express = require("express");
const multer = require("multer");
const router = express.Router();
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
var GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../models/User");

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
  registerUser,
  verifyEmail,
  verifyEmailProcess,
  login,
  logout,
  verifyUser,
  registerByGoogle,
  registerBylinkedIn,
} = require("../controllers/auth");

//middleware functions

const { protect, authorize, dashboard } = require("../middlewares/auth");

//Register USER routes

router.post("/register", registerUser);
router.get("/verify-user", protect, verifyUser);

router.post("/email-verfication", verifyEmail);
router.post("/verify-email/:token", verifyEmailProcess);

//LOGIN Route

router.post("/login", login);

//LOGOUT Route
router.post("/logout", logout);
// Google LOGIN route
router.post("/google-register", registerByGoogle);
// Linkedin LOGIN route
router.post("/linkedIn-register", registerBylinkedIn);


module.exports = router;
