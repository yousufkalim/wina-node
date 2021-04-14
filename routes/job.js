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

const upload = multer({ storage: storage }).single("image");

// Controller Functions //

const { CreateJob, EditJob, DeleteJob, GetJob } = require("../controllers/job");

//middleware functions

const { protect, validateType } = require("../middlewares/auth");

// Routes for Jobs //

// CREATE Job
router.post(
  "/create-job",
  [protect, validateType("company")],
  upload,
  CreateJob
);

// EDIT Job
router.put(
  "/edit-job/:id",
  [protect, validateType("company")],
  upload,
  EditJob
);
// get single Job
router.get("/get-job/:id", protect, GetJob);
// DELETE Job
router.put("/delete-job/:id", [protect, validateType("company")], DeleteJob);

// VIEW Single Job
// router.put("/view-job/:id", [protect, validateType("company")], getSingleJob);

module.exports = router;
