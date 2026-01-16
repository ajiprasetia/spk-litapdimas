// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/create-admin', authController.createAdmin); // Ini sebaiknya dilindungi di production

// Protected routes
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;