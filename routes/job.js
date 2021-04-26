const express = require("express");
const multer = require("multer");
const router = express.Router();
const { upload } = require("../middlewares/multer");

// MULTER Configuaration //

// Controller Functions //

const {
  CreateJob,
  EditJob,
  DeleteJob,
  GetJob,
  GetJobs,
  OfferDecisionByStudent,
  OfferDecisionByCompany,
  GetAppliedJobs,
} = require("../controllers/job");

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
router.get("/get-jobs", [protect, validateType("company")], GetJobs);
router.get(
  "/get-applied-jobs",
  [protect, validateType("company")],
  GetAppliedJobs
);

// DELETE Job
router.put("/delete-job/:id", [protect, validateType("company")], DeleteJob);

// student Offers********************************
// offer accepted by student
router.post(
  "/offer-decision-by-student/:id",
  [protect, validateType("student")],
  upload,
  OfferDecisionByStudent
);

// *****

// offer accepted by company
router.post(
  "/offer-decision-by-company/:id",
  [protect, validateType("company")],
  upload,
  OfferDecisionByCompany
);
// VIEW Single Job
// router.put("/view-job/:id", [protect, validateType("company")], getSingleJob);

module.exports = router;
