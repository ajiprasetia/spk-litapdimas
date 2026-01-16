// backend/controllers/reviewerController.js
const Reviewer = require('../models/reviewerModel');

exports.getStatusReviewer = async (req, res) => {
  try {
    const status = await Reviewer.findByUserId(req.user.id);
    if (!status) {
      const eligibility = await Reviewer.checkEligibility(req.user.id);
      return res.json({
        status_reviewer: 'Belum Terdaftar',
        message: eligibility.message,
        eligible: eligibility.eligible
      });
    }
    res.json(status);
  } catch (error) {
    console.error('Get status reviewer error:', error);
    res.status(500).json({ message: 'Gagal memuat status reviewer' });
  }
};

exports.getAllPengajuan = async (req, res) => {
  try {
    const pengajuan = await Reviewer.findAll();
    res.json(pengajuan);
  } catch (error) {
    console.error('Get all pengajuan error:', error);
    res.status(500).json({ message: 'Gagal memuat pengajuan reviewer' });
  }
};

exports.ajukanReviewer = async (req, res) => {
  try {
    const userId = req.user.id;
    // Check eligibility
    const eligibility = await Reviewer.checkEligibility(userId);
    if (!eligibility.eligible) {
      return res.status(400).json({ message: eligibility.message });
    }
    
    // Check if already submitted
    const existing = await Reviewer.findByUserId(userId);
    if (existing) {
      return res.status(400).json({
        message: 'Anda sudah pernah mengajukan sebagai reviewer'
      });
    }
    
    await Reviewer.create(userId);
    res.status(201).json({
      message: 'Pengajuan berhasil dikirim. Silahkan tunggu persetujuan admin'
    });
  } catch (error) {
    console.error('Ajukan reviewer error:', error);
    res.status(500).json({ message: 'Error submitting pengajuan' });
  }
};

exports.ajukanRevisi = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await Reviewer.findByUserId(userId);
    if (!status || status.status_reviewer !== 'Revisi Pengajuan') {
      return res.status(400).json({
        message: 'Tidak dapat mengajukan revisi saat ini'
      });
    }
    
    await Reviewer.submitRevision(userId);
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
      status_reviewer: status === 'Disetujui' ? 'Terdaftar' : 'Revisi Pengajuan',
      catatan_admin: catatan,
      tanggal_disetujui: status === 'Disetujui' ? new Date() : null
    };
    
    await Reviewer.update(user_id, data);
    
    res.json({
      message: `Pengajuan telah ${status === 'Disetujui' ? 'disetujui' : 'diminta revisi'}`
    });
  } catch (error) {
    console.error('Verifikasi pengajuan error:', error);
    res.status(500).json({ message: 'Error verifying pengajuan' });
  }
};