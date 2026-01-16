// backend/routes/tahunAnggaranRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const tahunAnggaranController = require('../controllers/tahunAnggaranController');

// Get all tahun anggaran (accessible by all authenticated users)
router.get('/', verifyToken, tahunAnggaranController.getAllTahunAnggaran);

// Get active tahun anggaran (accessible by all authenticated users)
router.get('/active/current', verifyToken, tahunAnggaranController.getActiveTahunAnggaran);

// Get tahun anggaran by id (accessible by all authenticated users)
router.get('/:id', verifyToken, tahunAnggaranController.getTahunAnggaranById);

// Admin only routes
// Create new tahun anggaran
router.post('/', verifyToken, verifyAdmin, tahunAnggaranController.createTahunAnggaran);

// Update tahun anggaran
router.put('/:id', verifyToken, verifyAdmin, tahunAnggaranController.updateTahunAnggaran);

// Delete tahun anggaran
router.delete('/:id', verifyToken, verifyAdmin, tahunAnggaranController.deleteTahunAnggaran);

module.exports = router;