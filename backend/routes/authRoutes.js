const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const authController = require('../controllers/api/authController');

router.get('/check-auth', authenticateUser, authController.checkAuthStatus);
router.get('/logout', authenticateUser, authController.logout);

module.exports = router;
