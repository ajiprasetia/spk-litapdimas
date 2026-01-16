// backend/routes/reviewerRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const reviewerController = require('../controllers/reviewerController');

// User routes
router.get('/status', verifyToken, reviewerController.getStatusReviewer);
router.post('/ajukan', verifyToken, reviewerController.ajukanReviewer);
router.post('/revisi', verifyToken, reviewerController.ajukanRevisi);

// Admin routes
router.get('/pengajuan', verifyToken, verifyAdmin, reviewerController.getAllPengajuan);
router.post('/verifikasi/:user_id', verifyToken, verifyAdmin, reviewerController.verifikasiPengajuan);

module.exports = router;