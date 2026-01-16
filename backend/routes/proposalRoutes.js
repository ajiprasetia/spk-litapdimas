// backend/routes/proposalRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { uploadProposal } = require('../middleware/uploadMiddleware');
const proposalController = require('../controllers/proposalController');

// User routes
router.get('/', verifyToken, proposalController.getAllProposal);
router.get('/:id', verifyToken, proposalController.getProposalById);
router.post('/',
  verifyToken,
  uploadProposal.fields([
    { name: 'file_proposal', maxCount: 1 },
    { name: 'file_rab', maxCount: 1 }
  ]),
  proposalController.createProposal
);

// Admin routes
router.get('/admin/all', verifyToken, verifyAdmin, proposalController.getAllProposalAdmin);
router.put('/admin/:id/status', verifyToken, verifyAdmin, proposalController.updateStatus);
router.get('/:id/reviewers', verifyToken, verifyAdmin, proposalController.getAvailableReviewers);

module.exports = router;