const router = require('express').Router();
const { register, login,confirmAuth } = require('../controllers/authAdmins');
const { checkAdminAuth } = require('../middlewares/adminAuth');
// Admin Register
router.post('/', register);
router.post('/login', login);
router.get('/auth', checkAdminAuth, confirmAuth);
module.exports = router;