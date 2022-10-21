const router = require('express').Router();
const { register, login } = require('../controllers/authAdmins');
// Admin Register
router.post('/', register);
router.post('/login', login);

module.exports = router;