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
  addStage,
  deleteMember,
  deleteStage,
  updateStage,
  updateMember

} = require("../controllers/company");

//middleware functions
const { protect, validateType } = require("../middlewares/auth");
//Validation
const {validateMember,validateStage,validateStageDel,validateMemberDel,
  validateUpdateStage,validateUpdateMember,
  isValidated}=require("../middlewares/validators")

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
router.put("/updateMember",upload,validateUpdateMember,isValidated,updateMember)
router.put("/updateStage",upload,validateUpdateStage,isValidated,updateStage)
router.put("/deleteStage/:comapnyId",validateStageDel,isValidated,deleteStage)
router.put("/deleteMember/:comapnyId",validateMemberDel,isValidated,deleteMember)
module.exports = router;
