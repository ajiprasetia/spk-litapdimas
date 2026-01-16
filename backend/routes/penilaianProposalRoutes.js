// backend/routes/penilaianProposalRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const penilaianProposalController = require('../controllers/penilaianProposalController');

// Get daftar penugasan reviewer
router.get('/penugasan', verifyToken, penilaianProposalController.getDaftarPenugasan);

// Get detail proposal & form penilaian
router.get('/:id', verifyToken, penilaianProposalController.getDetailPenilaian);

// Submit penilaian
router.post('/', verifyToken, penilaianProposalController.submitPenilaian);

module.exports = router;