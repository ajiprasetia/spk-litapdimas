// backend/routes/klasterRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const klasterController = require('../controllers/klasterController');

// Get all klaster (accessible by all authenticated users)
router.get('/', verifyToken, klasterController.getAllKlaster);

// Get klaster by tahun anggaran (accessible by all authenticated users)
// Keep original endpoint path to maintain compatibility
router.get('/tahun/:tahunAnggaranId', verifyToken, klasterController.getKlasterByTahunAnggaran);

// Get klaster by active tahun anggaran (accessible by all authenticated users)
router.get('/active/current', verifyToken, klasterController.getKlasterByActiveTahunAnggaran);

// Get klaster by id (accessible by all authenticated users)
router.get('/:id', verifyToken, klasterController.getKlasterById);

// Admin only routes
// Create new klaster
router.post('/', verifyToken, verifyAdmin, klasterController.createKlaster);

// Update klaster
router.put('/:id', verifyToken, verifyAdmin, klasterController.updateKlaster);

// Delete klaster
router.delete('/:id', verifyToken, verifyAdmin, klasterController.deleteKlaster);

module.exports = router;