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

const upload = multer({ storage: storage }).fields([
  {
    name: "video",
    maxCount: 1,
  },
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "resume",
    maxCount: 1,
  },
]);

// Controller Functions //

const {
  register,
  edit,
  GetStudentProfile,
  DeleteProfile,
  bookCoachingAppointment,
  searchForJob,
} = require("../controllers/student");

//middleware functions

const { protect, validateType } = require("../middlewares/auth");

// Routes for Students //
router.get("/getStudentProfile/:id", protect, GetStudentProfile);

router.post("/add-info", [protect, validateType("student")], upload, register);

router.put("/edit-info/:id", [protect, validateType("student")], upload, edit);

router.delete("/delete-profile", protect, DeleteProfile);

// Book Coaching Appointment //
router.post(
  "/book-appointment",
  [protect, validateType("student")],
  bookCoachingAppointment
);

// Search for Jobs //
router.post("/search-job", [protect, validateType("student")], searchForJob);

module.exports = router;
