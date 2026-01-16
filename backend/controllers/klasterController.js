// backend/controllers/klasterController.js
const Klaster = require('../models/klasterModel');

exports.getAllKlaster = async (req, res) => {
  try {
    const klaster = await Klaster.findAll();
    res.json(klaster);
  } catch (error) {
    console.error('Get all klaster error:', error);
    res.status(500).json({ message: 'Gagal memuat klaster' });
  }
};

exports.getKlasterByTahunAnggaran = async (req, res) => {
  try {
    const { tahunAnggaranId } = req.params;
    
    if (!tahunAnggaranId) {
      return res.status(400).json({ message: 'Tahun anggaran ID is required' });
    }

    const klaster = await Klaster.findByTahunAnggaran(tahunAnggaranId);
    res.json(klaster);
  } catch (error) {
    console.error('Get klaster by tahun anggaran error:', error);
    res.status(500).json({ message: 'Gagal memuat klaster berdasarkan tahun anggaran' });
  }
};

exports.getKlasterByActiveTahunAnggaran = async (req, res) => {
  try {
    const klaster = await Klaster.findByActiveTahunAnggaran();
    res.json(klaster);
  } catch (error) {
    console.error('Get klaster by active tahun anggaran error:', error);
    res.status(500).json({ message: 'Gagal memuat klaster tahun anggaran aktif' });
  }
};

exports.getKlasterById = async (req, res) => {
  try {
    const klaster = await Klaster.findById(req.params.id);
    
    if (!klaster) {
      return res.status(404).json({ message: 'Klaster not found' });
    }
    
    res.json(klaster);
  } catch (error) {
    console.error('Get klaster error:', error);
    res.status(500).json({ message: 'Error getting klaster' });
  }
};

exports.createKlaster = async (req, res) => {
  try {
    const {
      tahun_anggaran_id,
      nama_klaster,
      kuota_pendanaan,
      persyaratan_administratif,
      output,
      outcomes
    } = req.body;

    // Basic validation
    if (!nama_klaster) {
      return res.status(400).json({ message: 'Nama klaster is required' });
    }

    if (!tahun_anggaran_id) {
      return res.status(400).json({ message: 'Tahun anggaran is required' });
    }

    if (!kuota_pendanaan || kuota_pendanaan < 0) {
      return res.status(400).json({ message: 'Kuota pendanaan tidak boleh negatif' });
    }

    // Check for duplicate klaster name in the same year
    const existingKlaster = await Klaster.findByTahunAnggaran(tahun_anggaran_id);
    const duplicateName = existingKlaster.find(k => 
      k.nama_klaster.toLowerCase() === nama_klaster.toLowerCase()
    );
    
    if (duplicateName) {
      return res.status(400).json({ 
        message: 'Nama klaster sudah ada di tahun anggaran ini' 
      });
    }

    const id = await Klaster.create({
      tahun_anggaran_id,
      nama_klaster,
      kuota_pendanaan,
      persyaratan_administratif: Array.isArray(persyaratan_administratif) ? 
        persyaratan_administratif : [],
      output: Array.isArray(output) ? output : [],
      outcomes: Array.isArray(outcomes) ? outcomes : []
    });

    const newKlaster = await Klaster.findById(id);
    
    res.status(201).json({
      message: 'Klaster berhasil dibuat',
      data: newKlaster
    });
  } catch (error) {
    console.error('Create klaster error:', error);
    
    if (error.message === 'Tahun anggaran tidak ditemukan') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Error creating klaster' });
  }
};

exports.updateKlaster = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      tahun_anggaran_id,
      nama_klaster,
      kuota_pendanaan,
      persyaratan_administratif,
      output,
      outcomes
    } = req.body;

    // Check if exists
    const exists = await Klaster.findById(id);
    if (!exists) {
      return res.status(404).json({ message: 'Klaster not found' });
    }

    // Basic validation
    if (!nama_klaster) {
      return res.status(400).json({ message: 'Nama klaster is required' });
    }

    if (!tahun_anggaran_id) {
      return res.status(400).json({ message: 'Tahun anggaran is required' });
    }

    if (!kuota_pendanaan || kuota_pendanaan < 0) {
      return res.status(400).json({ message: 'Kuota pendanaan tidak boleh negatif' });
    }

    // Check for duplicate klaster name in the same year (excluding current klaster)
    const existingKlaster = await Klaster.findByTahunAnggaran(tahun_anggaran_id);
    const duplicateName = existingKlaster.find(k => 
      k.id !== parseInt(id) && k.nama_klaster.toLowerCase() === nama_klaster.toLowerCase()
    );
    
    if (duplicateName) {
      return res.status(400).json({ 
        message: 'Nama klaster sudah ada di tahun anggaran ini' 
      });
    }

    await Klaster.update(id, {
      tahun_anggaran_id,
      nama_klaster,
      kuota_pendanaan,
      persyaratan_administratif: Array.isArray(persyaratan_administratif) ? 
        persyaratan_administratif : [],
      output: Array.isArray(output) ? output : [],
      outcomes: Array.isArray(outcomes) ? outcomes : []
    });

    const updatedKlaster = await Klaster.findById(id);
    
    res.json({
      message: 'Klaster berhasil diperbarui',
      data: updatedKlaster
    });
  } catch (error) {
    console.error('Update klaster error:', error);
    
    if (error.message === 'Tahun anggaran tidak ditemukan' || 
        error.message === 'Klaster tidak ditemukan') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Error updating klaster' });
  }
};

exports.deleteKlaster = async (req, res) => {
  try {
    const id = req.params.id;

    const exists = await Klaster.findById(id);
    if (!exists) {
      return res.status(404).json({ message: 'Klaster not found' });
    }

    await Klaster.delete(id);
    
    res.json({ message: 'Klaster berhasil dihapus' });
  } catch (error) {
    console.error('Delete klaster error:', error);
    
    if (error.message.includes('masih digunakan')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Error deleting klaster' });
  }
};