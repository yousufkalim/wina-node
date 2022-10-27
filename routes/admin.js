const express = require('express');
const multer = require('multer');
const router = express.Router();

// MULTER Configuaration //
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
  destination: function (req, file, cb) {
    cb(null, 'views/uploads');
  }
});
const upload = multer({ storage: storage }).single('image');
// ADMIN CONTROLLER //
const {
  // Skills routes
  skillList,
  createSkill,
  editSkill,
  deleteSkill,
  allSkillList,
  //domain
  createDomain,
  domainList,
  editDomain,
  deleteDomain,
  countList,
  // ******
  jobList,
  CreateJob,
  EditJob,
  DeleteJob,
  registerCompany,
  editCompany,
  deleteCompany,
  companyList,
  registerUser,
  GetProfile,
  userList,
  editProfile,
  DeleteProfile,
  StudentfilesToValidate,
  validateImages,
  validateVideo,
  validateJobImages,
  createConsultantProfile,
  consultantProfileTeacher,
  consultantProfileStudent,
  registerSchool,
  editSchool,
  deleteSchool,
  validateAppointment,
  getAllAppointments,
  getAllPendingAppointments,
  getAllStudentAppointments,
  getAllCompanyAppointments,
  deleteAppointment,
  postSoftSkills,
  addJob,
  check,
  postHardSkills
} = require('../controllers/admin');

// Middleware Functions //
const { protect, authorize } = require('../middlewares/auth');

// ROUTES

//Skills
router.get('/skill-list', protect, skillList);
router.get('/all-skillslist/:id', allSkillList);
router.post('/create-skill', createSkill);
router.post('/postHardSkills', upload, postHardSkills);
router.post('/postSoftSkills', upload, postSoftSkills);
router.put('/edit-skill/:id', [protect, authorize('admin')], editSkill);
router.put('/delete-skill/:id', [protect, authorize('admin')], deleteSkill);

//Domain
router.get('/domain-list', domainList);
router.post('/create-domain', createDomain);
router.put('/edit-domain/:id', [protect, authorize('admin')], editDomain);
router.put('/delete-domain/:id', [protect, authorize('admin')], deleteDomain);

//Jobs
router.get('/job-list/:page/:pageSize', jobList);
router.post('/create-job', [protect, authorize('admin')], upload, CreateJob);
router.put('/edit-job/:id', [protect, authorize('admin')], upload, EditJob);
router.put('/delete-job/:id', [protect, authorize('admin')], DeleteJob);

//Companies
router.get('/company-list/:page/:pageSize', companyList);

router.post('/register-company', [protect, authorize('admin')], registerCompany);
router.put('/edit-company/:id', [protect, authorize('admin')], editCompany);
router.put('/delete-company/:id', [protect, authorize('admin')], deleteCompany);

//Users
router.post('/register-user', [protect, authorize('admin')], registerUser);
router.get('/get-profile/:id', [protect, authorize('admin')], GetProfile);
router.get('/user-list/:page/:pageSize', userList);
router.put('/editProfile/:id', [protect, authorize('admin')], editProfile);
router.put('/delete-profile/:id', [protect, authorize('admin')], DeleteProfile);

// VALIDATE PICTURES & VIDEOS
router.get('/filesToValidate', [protect, authorize('admin')], StudentfilesToValidate);
router.post('/validate-images', [protect, authorize('admin')], validateImages);
router.post('/validate-videos', [protect, authorize('admin')], validateVideo);
router.post('/validate-job-image', [protect, authorize('admin')], validateJobImages);

//Create Consultant Profiles
router.post('/create-consultant-profile', [protect, authorize('admin')], createConsultantProfile);
router.get('/consultant-profile-teacher', [protect, authorize('admin')], consultantProfileTeacher);
router.get('/consultant-profile-student', [protect, authorize('admin')], consultantProfileStudent);

// School //
router.post('/register-school', [protect, authorize('admin')], registerSchool);
router.put('/edit-school/:id', [protect, authorize('admin')], editSchool);
router.put('/delete-school/:id', [protect, authorize('admin')], deleteSchool);

//Appointments list
router.get('/appointment-list/:page/:pageSize', getAllAppointments);
//Pending Appointments list
router.get('/pending-appointmnets', [protect, authorize('admin')], getAllPendingAppointments);

//GET All Pending Student Appointments
router.get(
  '/student-pending-appointmnets',
  [protect, authorize('admin')],
  getAllStudentAppointments
);

//GET All Pending company Appointments
router.get(
  '/company-pending-appointmnets',
  [protect, authorize('admin')],
  getAllCompanyAppointments
);

//Delete Appointment
router.put('/delete-appointment/:id', [protect, authorize('admin')], deleteAppointment);
//Validate Appointments
router.post('/validate-appointmnet', [protect, authorize('admin')], validateAppointment);
router.post('/addJob', upload, addJob);

router.get('/count-list', countList);


module.exports = router;
