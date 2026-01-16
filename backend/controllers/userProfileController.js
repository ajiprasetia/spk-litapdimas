// backend/controllers/userProfileController.js
const UserProfile = require('../models/userProfileModel');
const fs = require('fs').promises;
const path = require('path');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await UserProfile.findByUserId(userId);
    
    if (!profile) {
      // Jika profil belum ada, kirim data default
      return res.json({
        user_id: userId,
        foto_profil: null,
        jenis_kelamin: '',
        nomor_whatsapp: '',
        alamat: '',
        online_profil: '',
        profesi: '',
        nip_niy: '',
        nidn: '',
        jabatan_fungsional: '',
        bidang_ilmu: ''
      });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Gagal memuat data profil'
    });
  }
};

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = {
      user_id: userId,
      ...req.body
    };

    const existingProfile = await UserProfile.findByUserId(userId);
    let result;

    if (existingProfile) {
      result = await UserProfile.update(userId, profileData);
    } else {
      result = await UserProfile.create(profileData);
    }

    res.json({
      success: true,
      message: 'Data profil berhasil diperbarui'
    });
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data profil'
    });
  }
};

exports.updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await UserProfile.findByUserId(userId);

    // Delete old photo if exists
    if (profile && profile.foto_profil) {
      const oldPhotoPath = path.join(__dirname, '..', 'public', 'uploads', 'profile', profile.foto_profil);
      try {
        await fs.unlink(oldPhotoPath);
      } catch (error) {
        console.error('Error deleting old photo:', error);
      }
    }

    // Update with new photo
    const photoPath = req.file ? req.file.filename : null;
    await UserProfile.updateFotoProfil(userId, photoPath);

    res.json({
      success: true,
      message: 'Foto profil berhasil diperbarui',
      photoPath: photoPath
    });
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupload foto profil'
    });
  }
};