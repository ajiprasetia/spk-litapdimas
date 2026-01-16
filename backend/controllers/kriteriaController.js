// backend/controllers/kriteriaController.js
const Kriteria = require('../models/kriteriaModel');

exports.getAllKriteria = async (req, res) => {
  try {
    const kriteria = await Kriteria.findAll();
    res.json(kriteria);
  } catch (error) {
    console.error('Get all kriteria error:', error);
    res.status(500).json({ message: 'Error getting kriteria' });
  }
};

exports.getKriteriaById = async (req, res) => {
  try {
    const kriteria = await Kriteria.findById(req.params.id);
    if (!kriteria) {
      return res.status(404).json({ message: 'Kriteria not found' });
    }
    res.json(kriteria);
  } catch (error) {
    console.error('Get kriteria error:', error);
    res.status(500).json({ message: 'Error getting kriteria' });
  }
};

exports.createKriteria = async (req, res) => {
  try {
    const { nama_kriteria } = req.body;

    if (!nama_kriteria) {
      return res.status(400).json({ message: 'Nama kriteria is required' });
    }

    // Generate next kode kriteria
    const kode_kriteria = await Kriteria.getNextKodeKriteria();

    const id = await Kriteria.create({
      kode_kriteria,
      nama_kriteria
    });

    const newKriteria = await Kriteria.findById(id);
    res.status(201).json({
      message: 'Kriteria berhasil ditambahkan',
      data: newKriteria
    });
  } catch (error) {
    console.error('Create kriteria error:', error);
    if (error.message === 'Kode kriteria sudah digunakan') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating kriteria' });
  }
};

exports.updateKriteria = async (req, res) => {
  try {
    const id = req.params.id;
    const { nama_kriteria } = req.body;

    const exists = await Kriteria.findById(id);
    if (!exists) {
      return res.status(404).json({ message: 'Kriteria not found' });
    }

    await Kriteria.update(id, {
      kode_kriteria: exists.kode_kriteria, // Maintain existing kode
      nama_kriteria
    });

    const updatedKriteria = await Kriteria.findById(id);
    res.json({
      message: 'Kriteria berhasil diperbarui',
      data: updatedKriteria
    });
  } catch (error) {
    console.error('Update kriteria error:', error);
    if (error.message === 'Kode kriteria sudah digunakan') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating kriteria' });
  }
};

exports.deleteKriteria = async (req, res) => {
  try {
    const id = req.params.id;
    const exists = await Kriteria.findById(id);
    if (!exists) {
      return res.status(404).json({ message: 'Kriteria not found' });
    }

    await Kriteria.delete(id);
    res.json({ message: 'Kriteria berhasil dihapus' });
  } catch (error) {
    console.error('Delete kriteria error:', error);
    res.status(500).json({ message: 'Error deleting kriteria' });
  }
};

exports.getNextKodeKriteria = async (req, res) => {
  try {
    const kode = await Kriteria.getNextKodeKriteria();
    res.json({ kode });
  } catch (error) {
    console.error('Get next kode error:', error);
    res.status(500).json({ message: 'Error getting next kode' });
  }
};