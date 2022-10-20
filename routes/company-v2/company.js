// comapany new dashboard routes
const router = require('express').Router();
const { upload } = require('../../middlewares/multer');
// Company controller
const {
  Register,
  EditCompany,
  DeleteCompany,
  bookCoachingAppointment,
  searchForStudents
} = require('../../controllers/company-v2/company');
// Company middleware
const {
  registerCompanyValidation,
  CompanyUpdateValidation,
  isValidated
} = require('../../middlewares/companyValidator');

const { protect, validateType } = require('../../middlewares/auth');

// Company registration
router.post('/', registerCompanyValidation, isValidated, Register);
// Update company
router.put(
  '/update',
  [protect, validateType('comapny')],
  CompanyUpdateValidation,
  isValidated,
  upload,
  EditCompany
);
// Delete company
router.delete('/delete', [protect, validateType('comapny')], DeleteCompany);

// booking coaching appointments
router.post(
  '/company/bookAppointment/:id',
  // [protect, validateType('company')],
  bookCoachingAppointment
);

// Searching for student
router.post('searchStudents/:id', [protect, validateType('company')]);

module.exports = router;
