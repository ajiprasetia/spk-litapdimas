// backend/routes/riwayatLoginRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const riwayatLoginController = require('../controllers/riwayatLoginController');

// Get login history for the authenticated user
router.get('/', verifyToken, riwayatLoginController.getRiwayatLogin);

module.exports = router;