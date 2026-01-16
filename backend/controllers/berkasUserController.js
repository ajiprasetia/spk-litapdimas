// backend/controllers/berkasUserController.js
const BerkasUser = require('../models/berkasUserModel');
const fs = require('fs').promises;
const path = require('path');

exports.getAllBerkas = async (req, res) => {
  try {
    const berkas = await BerkasUser.findAllByUserId(req.user.id);
    res.json(berkas);
  } catch (error) {
    console.error('Get berkas error:', error);
    res.status(500).json({ message: 'Gagal memuat data berkas' });
  }
};

exports.uploadBerkas = async (req, res) => {
  try {
    const { nama_berkas } = req.body;
    const fileBerkas = req.file.filename;
    const userId = req.user.id;

    const id = await BerkasUser.create(userId, nama_berkas, fileBerkas);
    const newBerkas = await BerkasUser.findById(id);

    res.status(201).json({
      success: true,
      message: 'Berkas berhasil ditambahkan',
      data: newBerkas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan berkas'
    });
  }
};

exports.updateBerkas = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nama_berkas } = req.body;
    const oldBerkas = await BerkasUser.findById(id);
    
    if (!oldBerkas) {
      return res.status(404).json({ message: 'Berkas not found' });
    }

    if (oldBerkas.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const newFileBerkas = req.file ? req.file.filename : null;

    // Delete old file if new file is uploaded
    if (newFileBerkas) {
      const oldFilePath = path.join(__dirname, '..', 'public', 'uploads', 'berkas', oldBerkas.file_berkas);
      try {
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.error('Error deleting old file:', error);
      }
    }

    await BerkasUser.update(id, nama_berkas, newFileBerkas);
    const updatedBerkas = await BerkasUser.findById(id);

    res.json({
      success: true,
      message: 'Berkas berhasil diperbarui',
      data: updatedBerkas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui berkas'
    });
  }
};

exports.deleteBerkas = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const berkas = await BerkasUser.findById(id);

    if (!berkas) {
      return res.status(404).json({ message: 'Berkas not found' });
    }

    if (berkas.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete file
    const filePath = path.join(__dirname, '..', 'public', 'uploads', 'berkas', berkas.file_berkas);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    await BerkasUser.delete(id);
    res.json({
      success: true,
      message: 'Berkas berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus berkas'
    });
  }
};