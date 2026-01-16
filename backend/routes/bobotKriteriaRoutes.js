// backend/routes/bobotKriteriaRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const bobotKriteriaController = require('../controllers/bobotKriteriaController');

router.get('/', verifyToken, bobotKriteriaController.getLatestBobot);
router.post('/hitung', verifyToken, verifyAdmin, bobotKriteriaController.hitungBobot);
router.post('/reset', verifyToken, verifyAdmin, bobotKriteriaController.resetBobot);

module.exports = router;