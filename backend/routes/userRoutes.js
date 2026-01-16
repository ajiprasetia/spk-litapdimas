// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// Admin routes untuk manajemen user
router.get('/all', verifyToken, verifyAdmin, userController.getAllUsers);
router.get('/:id', verifyToken, verifyAdmin, userController.getUserDetail);
router.delete('/:id', verifyToken, verifyAdmin, userController.deleteUser);

module.exports = router;