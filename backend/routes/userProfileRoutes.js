// backend/routes/userProfileRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadProfile } = require('../middleware/uploadMiddleware');
const userProfileController = require('../controllers/userProfileController');

// Get user profile
router.get('/profile', verifyToken, userProfileController.getProfile);

// Create or update profile
router.post('/profile', verifyToken, userProfileController.createOrUpdateProfile);

// Update profile photo
router.post(
  '/profile/photo',
  verifyToken,
  uploadProfile.single('foto_profil'),
  userProfileController.updateProfilePhoto
);

module.exports = router;