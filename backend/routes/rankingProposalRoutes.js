// backend/routes/rankingProposalRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const rankingProposalController = require('../controllers/rankingProposalController');

// Get proposals by klaster for ranking
router.get(
    '/proposals/:klaster_id',
    verifyToken,
    verifyAdmin,
    rankingProposalController.getProposalsByKlaster
);

// Get existing ranking by klaster
router.get(
    '/:klaster_id',
    verifyToken,
    verifyAdmin,
    rankingProposalController.getRankingByKlaster
);

// Get calculation details for a klaster
router.get(
    '/details/:klaster_id',
    verifyToken,
    verifyAdmin,
    rankingProposalController.getDetailPerhitungan
);

// Calculate and save ranking
router.post(
    '/calculate/:klaster_id',
    verifyToken,
    verifyAdmin,
    rankingProposalController.calculateRanking
);

// Reset ranking for a klaster
router.post(
    '/reset/:klaster_id',
    verifyToken,
    verifyAdmin,
    rankingProposalController.resetRanking
);

router.get(
  '/detail-penilaian/:proposal_id',
  verifyToken,
  verifyAdmin,
  rankingProposalController.getDetailPenilaianProposal
);

module.exports = router;