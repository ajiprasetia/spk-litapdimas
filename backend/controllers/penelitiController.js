// backend/controllers/penelitiController.js
const Peneliti = require('../models/penelitiModel');

exports.getStatusPeneliti = async (req, res) => {
  try {
    const status = await Peneliti.findByUserId(req.user.id);
    if (!status) {
      return res.json({
        status_peneliti: 'Belum Terdaftar',
        message: 'Anda belum terdaftar sebagai peneliti'
      });
    }
    res.json(status);
  } catch (error) {
    console.error('Get status peneliti error:', error);
    res.status(500).json({ message: 'Gagal memuat status peneliti' });
  }
};

exports.getAllPengajuan = async (req, res) => {
  try {
    const pengajuan = await Peneliti.findAll();
    res.json(pengajuan);
  } catch (error) {
    console.error('Get all pengajuan error:', error);
    res.status(500).json({ message: 'Gagal memuat pengajuan peneliti' });
  }
};

exports.ajukanPeneliti = async (req, res) => {
  try {
    const userId = req.user.id;
    // Check if already submitted
    const existing = await Peneliti.findByUserId(userId);
    if (existing) {
      return res.status(400).json({
        message: 'Anda sudah pernah mengajukan sebagai peneliti'
      });
    }
    await Peneliti.create(userId);
    res.status(201).json({
      message: 'Pengajuan berhasil dikirim. Silahkan tunggu persetujuan admin'
    });
  } catch (error) {
    console.error('Ajukan peneliti error:', error);
    res.status(500).json({ message: 'Error submitting pengajuan' });
  }
};

exports.ajukanRevisi = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await Peneliti.findByUserId(userId);
    if (!status || status.status_peneliti !== 'Revisi Pengajuan') {
      return res.status(400).json({
        message: 'Tidak dapat mengajukan revisi saat ini'
      });
    }
    await Peneliti.submitRevision(userId);
    res.json({
      message: 'Revisi berhasil diajukan. Silahkan tunggu review admin'
    });
  } catch (error) {
    console.error('Ajukan revisi error:', error);
    res.status(500).json({ message: 'Error submitting revision' });
  }
};

exports.verifikasiPengajuan = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { status, catatan } = req.body;
    
    if (!['Disetujui', 'Revisi'].includes(status)) {
      return res.status(400).json({
        message: 'Status verifikasi tidak valid'
      });
    }
    
    const data = {
      status_peneliti: status === 'Disetujui' ? 'Terdaftar' : 'Revisi Pengajuan',
      catatan_admin: catatan,
      tanggal_disetujui: status === 'Disetujui' ? new Date() : null
    };
    
    await Peneliti.update(user_id, data);
    
    res.json({
      message: `Pengajuan telah ${status === 'Disetujui' ? 'disetujui' : 'diminta revisi'}`
    });
  } catch (error) {
    console.error('Verifikasi pengajuan error:', error);
    res.status(500).json({ message: 'Error verifying pengajuan' });
  }
};