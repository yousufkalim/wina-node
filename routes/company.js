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
  updateMember,
  updateCompany,
  companyProfile,
  updateTeamDescription,
  updateStageDescription
} = require('../controllers/company');

//middleware functions
const { protect, validateType } = require('../middlewares/auth');
//Validation
const {
  validateMember,
  validateStage,
  validateStageDel,
  validateMemberDel,
  validateUpdateStage,
  validateUpdateMember,
  validateUpdateComapny,
  isValidated
} = require('../middlewares/validators');

router.post('/register-company', register);

router.put('/edit-company', [protect, validateType('company')], editCompany);

router.delete('/delete-company', [protect, validateType('company')], deleteCompany);

// Book Coaching Appointment //
router.post(
  '/book-coaching-appointment/:id',
  [protect, validateType('company')],
  bookCoachingAppointment
);

// Search for Students //
router.post('/search-students/:id', [protect, validateType('company')], searchForStudents);

/**
 * ////////////////////////// Routes /////////////////////////
 * @author Shuja Naqvi
 */
router.put('/addMember', upload, validateMember, isValidated, addMember);
router.put('/addStage', upload, validateStage, isValidated, addStage);
router.put('/updateMember', upload, validateUpdateMember, isValidated, updateMember);
router.put('/updateStage', upload, validateUpdateStage, isValidated, updateStage);
router.put('/deleteStage/:comapnyId', validateStageDel, isValidated, deleteStage);
router.put('/deleteMember/:comapnyId', validateMemberDel, isValidated, deleteMember);
/**
 * ////////////////////////// Routes /////////////////////////
 * @author Rana Ameer Hamza
 */
router.get('/profile/:companyId', companyProfile);
router.post('/updateCompany/:companyId', upload, validateUpdateComapny, isValidated, updateCompany);
router.put(
  '/updateTeam/description/:companyId',
  updateTeamDescription,
  isValidated,
  updateTeamDescription
);
router.put(
  '/updateStage/description/:companyId',
  updateStageDescription,
  isValidated,
  updateStageDescription
);

module.exports = router;



