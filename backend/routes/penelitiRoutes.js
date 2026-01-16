// backend/routes/penelitiRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const penelitiController = require('../controllers/penelitiController');

// User routes
router.get('/status', verifyToken, penelitiController.getStatusPeneliti);
router.post('/ajukan', verifyToken, penelitiController.ajukanPeneliti);
router.post('/revisi', verifyToken, penelitiController.ajukanRevisi);

// Admin routes
router.get('/pengajuan', verifyToken, verifyAdmin, penelitiController.getAllPengajuan);
router.post('/verifikasi/:user_id', verifyToken, verifyAdmin, penelitiController.verifikasiPengajuan);

module.exports = router;