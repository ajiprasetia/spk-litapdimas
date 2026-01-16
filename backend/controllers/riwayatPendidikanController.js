// backend/controllers/riwayatPendidikanController.js
const RiwayatPendidikan = require('../models/riwayatPendidikanModel');
const fs = require('fs').promises;
const path = require('path');

exports.getRiwayatPendidikan = async (req, res) => {
  try {
    const userId = req.user.id;
    const riwayat = await RiwayatPendidikan.findByUserId(userId);
    res.json(riwayat);
  } catch (error) {
    console.error('Get riwayat pendidikan error:', error);
    res.status(500).json({
      message: 'Gagal memuat data riwayat pendidikan'
    });
  }
};

exports.createRiwayatPendidikan = async (req, res) => {
  try {
    const userId = req.user.id;
    const fileIjazah = req.file ? req.file.filename : null;

    const riwayatData = {
      user_id: userId,
      jenjang: req.body.jenjang,
      program_studi: req.body.program_studi,
      perguruan_tinggi: req.body.perguruan_tinggi,
      tahun_lulus: parseInt(req.body.tahun_lulus),
      file_ijazah: fileIjazah
    };

    const id = await RiwayatPendidikan.create(riwayatData);
    const newRiwayat = await RiwayatPendidikan.findById(id);

    res.status(201).json({
      success: true,
      message: 'Riwayat pendidikan berhasil ditambahkan',
      data: newRiwayat
    });
  } catch (error) {
    console.error('Create riwayat pendidikan error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan riwayat pendidikan'
    });
  }
};

exports.updateRiwayatPendidikan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const oldRiwayat = await RiwayatPendidikan.findById(id);

    if (!oldRiwayat) {
      return res.status(404).json({
        message: 'Riwayat pendidikan not found'
      });
    }

    // Check ownership
    if (oldRiwayat.user_id !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized'
      });
    }

    const fileIjazah = req.file ? req.file.filename : oldRiwayat.file_ijazah;

    // If new file is uploaded, delete old file
    if (req.file && oldRiwayat.file_ijazah) {
      const oldFilePath = path.join(__dirname, '..', 'public', 'uploads', 'ijazah', oldRiwayat.file_ijazah);
      try {
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.error('Error deleting old file:', error);
      }
    }

    const riwayatData = {
      jenjang: req.body.jenjang,
      program_studi: req.body.program_studi,
      perguruan_tinggi: req.body.perguruan_tinggi,
      tahun_lulus: parseInt(req.body.tahun_lulus),
      file_ijazah: fileIjazah
    };

    await RiwayatPendidikan.update(id, riwayatData);
    const updatedRiwayat = await RiwayatPendidikan.findById(id);

    res.json({
      success: true,
      message: 'Riwayat pendidikan berhasil diperbarui',
      data: updatedRiwayat
    });
  } catch (error) {
    console.error('Update riwayat pendidikan error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui riwayat pendidikan'
    });
  }
};

exports.deleteRiwayatPendidikan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const riwayat = await RiwayatPendidikan.findById(id);

    if (!riwayat) {
      return res.status(404).json({
        message: 'Riwayat pendidikan not found'
      });
    }

    // Check ownership
    if (riwayat.user_id !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized'
      });
    }

    // Delete file if exists
    if (riwayat.file_ijazah) {
      const filePath = path.join(__dirname, '..', 'public', 'uploads', 'ijazah', riwayat.file_ijazah);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    await RiwayatPendidikan.delete(id);

    res.json({
      success: true,
      message: 'Riwayat pendidikan berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete riwayat pendidikan error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus riwayat pendidikan'
    });
  }
};
