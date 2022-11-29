/**
 * Interview CRUD routes
 * @author Shuja Naqvi
 */
const router = require('express').Router();
const {
  validateInterview,
  validateupdateInterview,
  isValidated
} = require('../middlewares/validators');
const interview = require('../controllers/interviews');
/**
 * ////////////////////////// Routes /////////////////////////
 * @method post interview create
 * @method get get all interviews
 * @method get get interview by id
 * @method put update interview
 * @method delete delete interview
 */

router.post('/virtualInterview', validateInterview, isValidated, interview.virtualInterview);
router.post('/physicalInterview', validateInterview, isValidated, interview.physicalInterview);
router.get('/getInterviews/:companyId/:studentId', interview.getInterviews);
router.get('/getByCompany/:companyId', interview.getByCompany);
router.get('/getByStudent/:studentId', interview.getByStudent);
router.get('/getOffersStudent/:studentId', interview.getOffersStudent);
//getRejectedOffersStudent
router.get('/getRejectedOffersStudent/:studentId', interview.getRejectedOffersStudent);

router.get('/:interviewId', interview.getById);
router.put('/:interviewId', validateupdateInterview, isValidated, interview.update);

// Export
module.exports = router;
