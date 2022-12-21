/**
 * Interview CRUD routes
 * @author Shuja Naqvi
 */
const router = require('express').Router();
const {
  validateInterview,
  validateupdateInterview,
  validateInterviewStaus,
  isValidated
} = require('../middlewares/validators');
const { isPremium } = require('../middlewares/packageCheck');
const interview = require('../controllers/interviews');
/**
 * ////////////////////////// Routes /////////////////////////
 * @method post interview create
 * @method get get all interviews
 * @method get get interview by id
 * @method put update interview
 * @method delete delete interview
 */

router.post(
  '/virtualInterview',
  validateInterview,
  isValidated,
  isPremium,
  interview.virtualInterview
);
router.post(
  '/physicalInterview',
  validateInterview,
  isValidated,
  isPremium,
  interview.physicalInterview
);
router.get('/getInterviews/:companyId/:studentId', interview.getInterviews);
router.get('/getByCompany/:companyId', interview.getByCompany);
router.get('/getByStudent/:studentId', interview.getByStudent);
router.get('/getOffersStudent/:studentId', interview.getOffersStudent);
//getRejectedOffersStudent
router.get('/getRejectedOffersStudent/:studentId', interview.getRejectedOffersStudent);

router.get('/:interviewId', interview.getById);
router.put('/:interviewId', validateupdateInterview, isValidated, interview.update);
router.put(
  '/updateStudentInterview/:interviewId',
  validateInterviewStaus,
  isValidated,
  interview.updateStudentInterview
);

// Export
module.exports = router;
