// backend/routes/riwayatPendidikanRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadIjazah } = require('../middleware/uploadMiddleware');
const riwayatPendidikanController = require('../controllers/riwayatPendidikanController');

// Get all riwayat pendidikan for user
router.get('/', verifyToken, riwayatPendidikanController.getRiwayatPendidikan);

// Create new riwayat pendidikan
router.post('/', 
  verifyToken, 
  uploadIjazah.single('file_ijazah'),
  riwayatPendidikanController.createRiwayatPendidikan
);

// Update riwayat pendidikan
router.put('/:id', 
  verifyToken,
  uploadIjazah.single('file_ijazah'),
  riwayatPendidikanController.updateRiwayatPendidikan
);

// Delete riwayat pendidikan
router.delete('/:id', verifyToken, riwayatPendidikanController.deleteRiwayatPendidikan);

module.exports = router;