// backend/routes/berkasUserRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadBerkas } = require('../middleware/uploadMiddleware');
const berkasUserController = require('../controllers/berkasUserController');

// Get all berkas
router.get('/', verifyToken, berkasUserController.getAllBerkas);

// Upload new berkas
router.post('/', 
  verifyToken,
  uploadBerkas.single('file_berkas'),
  berkasUserController.uploadBerkas
);

// Update berkas
router.put('/:id',
  verifyToken,
  uploadBerkas.single('file_berkas'),
  berkasUserController.updateBerkas
);

// Delete berkas
router.delete('/:id', verifyToken, berkasUserController.deleteBerkas);

module.exports = router;