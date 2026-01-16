// backend/controllers/tahunAnggaranController.js
const TahunAnggaran = require('../models/tahunAnggaranModel');

exports.getAllTahunAnggaran = async (req, res) => {
  try {
    // Update status before fetching
    await TahunAnggaran.updateAllStatus();
    
    const tahunAnggaran = await TahunAnggaran.findAll();
    res.json(tahunAnggaran);
  } catch (error) {
    console.error('Get all tahun anggaran error:', error);
    res.status(500).json({ message: 'Gagal memuat tahun anggaran' });
  }
};

exports.getTahunAnggaranById = async (req, res) => {
  try {
    const tahunAnggaran = await TahunAnggaran.findById(req.params.id);
    
    if (!tahunAnggaran) {
      return res.status(404).json({ message: 'Tahun anggaran tidak ditemukan' });
    }
    
    res.json(tahunAnggaran);
  } catch (error) {
    console.error('Get tahun anggaran error:', error);
    res.status(500).json({ message: 'Error getting tahun anggaran' });
  }
};

exports.createTahunAnggaran = async (req, res) => {
  try {
    const {
      tahun_anggaran,
      total_anggaran,
      tanggal_mulai,
      tanggal_selesai,
      deskripsi
    } = req.body;

    // Basic validation
    if (!tahun_anggaran) {
      return res.status(400).json({ message: 'Tahun anggaran is required' });
    }

    if (!total_anggaran || isNaN(total_anggaran) || total_anggaran < 0) {
      return res.status(400).json({ message: 'Total anggaran harus berupa angka positif' });
    }

    if (!tanggal_mulai || !tanggal_selesai) {
      return res.status(400).json({ message: 'Tanggal mulai dan selesai is required' });
    }

    // Validate date range
    const startDate = new Date(tanggal_mulai);
    const endDate = new Date(tanggal_selesai);
    
    if (startDate >= endDate) {
      return res.status(400).json({ 
        message: 'Tanggal selesai harus lebih besar dari tanggal mulai' 
      });
    }

    // Validate year range (should be reasonable)
    const currentYear = new Date().getFullYear();
    if (tahun_anggaran < 2020 || tahun_anggaran > currentYear + 5) {
      return res.status(400).json({ 
        message: 'Tahun anggaran tidak valid' 
      });
    }

    const id = await TahunAnggaran.create({
      tahun_anggaran,
      total_anggaran,
      tanggal_mulai,
      tanggal_selesai,
      deskripsi
    });

    const newTahunAnggaran = await TahunAnggaran.findById(id);
    
    res.status(201).json({
      message: 'Tahun anggaran berhasil dibuat',
      data: newTahunAnggaran
    });
  } catch (error) {
    console.error('Create tahun anggaran error:', error);
    
    if (error.message === 'Tahun anggaran sudah ada') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Error creating tahun anggaran' });
  }
};

exports.updateTahunAnggaran = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      tahun_anggaran,
      total_anggaran,
      tanggal_mulai,
      tanggal_selesai,
      deskripsi
    } = req.body;

    // Check if exists
    const exists = await TahunAnggaran.findById(id);
    if (!exists) {
      return res.status(404).json({ message: 'Tahun anggaran tidak ditemukan' });
    }

    // Basic validation
    if (!tahun_anggaran) {
      return res.status(400).json({ message: 'Tahun anggaran is required' });
    }

    if (!total_anggaran || isNaN(total_anggaran) || total_anggaran < 0) {
      return res.status(400).json({ message: 'Total anggaran harus berupa angka positif' });
    }

    if (!tanggal_mulai || !tanggal_selesai) {
      return res.status(400).json({ message: 'Tanggal mulai dan selesai is required' });
    }

    // Validate date range
    const startDate = new Date(tanggal_mulai);
    const endDate = new Date(tanggal_selesai);
    
    if (startDate >= endDate) {
      return res.status(400).json({ 
        message: 'Tanggal selesai harus lebih besar dari tanggal mulai' 
      });
    }

    // Validate year range
    const currentYear = new Date().getFullYear();
    if (tahun_anggaran < 2020 || tahun_anggaran > currentYear + 5) {
      return res.status(400).json({ 
        message: 'Tahun anggaran tidak valid' 
      });
    }

    await TahunAnggaran.update(id, {
      tahun_anggaran,
      total_anggaran,
      tanggal_mulai,
      tanggal_selesai,
      deskripsi
    });

    const updatedTahunAnggaran = await TahunAnggaran.findById(id);
    
    res.json({
      message: 'Tahun anggaran berhasil diperbarui',
      data: updatedTahunAnggaran
    });
  } catch (error) {
    console.error('Update tahun anggaran error:', error);
    
    if (error.message === 'Tahun anggaran sudah ada') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Error updating tahun anggaran' });
  }
};

exports.deleteTahunAnggaran = async (req, res) => {
  try {
    const id = req.params.id;

    const exists = await TahunAnggaran.findById(id);
    if (!exists) {
      return res.status(404).json({ message: 'Tahun anggaran tidak ditemukan' });
    }

    await TahunAnggaran.delete(id);
    
    res.json({ message: 'Tahun anggaran berhasil dihapus' });
  } catch (error) {
    console.error('Delete tahun anggaran error:', error);
    res.status(500).json({ message: 'Error deleting tahun anggaran' });
  }
};

exports.getActiveTahunAnggaran = async (req, res) => {
  try {
    // Update status before fetching
    await TahunAnggaran.updateAllStatus();
    
    const activeTahunAnggaran = await TahunAnggaran.getActiveYear();
    
    if (!activeTahunAnggaran) {
      return res.json(null); // Return null instead of 404, frontend will handle it
    }
    
    res.json(activeTahunAnggaran);
  } catch (error) {
    console.error('Get active tahun anggaran error:', error);
    res.status(500).json({ message: 'Error getting active tahun anggaran' });
  }
};