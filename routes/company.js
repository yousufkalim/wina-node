const express = require("express");
const multer = require("multer");
const router = express.Router();
const { upload } = require("../middlewares/multer");

// Controller Functions //
const {
  register,
  editCompany,
  deleteCompany,
  bookCoachingAppointment,
  searchForStudents,
  addMember,
  addStage
} = require("../controllers/company");

//middleware functions
const { protect, validateType } = require("../middlewares/auth");
//Validation
const {validateMember,validateStage,isValidated}=require("../middlewares/validators")

router.post("/register-company", register);

router.put("/edit-company", [protect, validateType("company")], editCompany);

router.delete(
  "/delete-company",
  [protect, validateType("company")],
  deleteCompany
);

// Book Coaching Appointment //
router.post(
  "/book-coaching-appointment/:id",
  [protect, validateType("company")],
  bookCoachingAppointment
);

// Search for Students //
router.post(
  "/search-students/:id",
  [protect, validateType("company")],
  searchForStudents
);

/**
 * ////////////////////////// Routes /////////////////////////
 * @author Shuja Naqvi
 */
router.put("/addMember",upload,validateMember,isValidated,addMember)
router.put("/addStage",upload,validateStage,isValidated,addStage)
module.exports = router;
