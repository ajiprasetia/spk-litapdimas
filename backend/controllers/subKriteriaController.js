// backend/controllers/subKriteriaController.js
const SubKriteria = require('../models/subKriteriaModel');
const Kriteria = require('../models/kriteriaModel');

exports.getAllSubKriteria = async (req, res) => {
  try {
    const subKriteria = await SubKriteria.findAll();
    const kriteria = await Kriteria.findAll();
    res.json({
      kriteria,
      subKriteria
    });
  } catch (error) {
    console.error('Get all sub kriteria error:', error);
    res.status(500).json({ message: 'Error getting sub kriteria' });
  }
};

exports.getByKriteria = async (req, res) => {
  try {
    const kriteriaId = req.params.kriteriaId;
    const subKriteria = await SubKriteria.findByKriteria(kriteriaId);
    res.json(subKriteria);
  } catch (error) {
    console.error('Get sub kriteria error:', error);
    res.status(500).json({ message: 'Error getting sub kriteria' });
  }
};

exports.createSubKriteria = async (req, res) => {
  try {
    const { kriteria_id, tipe, skor, deskripsi } = req.body;

    if (!kriteria_id || !tipe || !skor || !deskripsi) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    const id = await SubKriteria.create({
      kriteria_id,
      tipe,
      skor,
      deskripsi
    });

    const subKriteria = await SubKriteria.findAll();
    res.status(201).json({
      message: 'Sub kriteria berhasil ditambahkan',
      data: subKriteria
    });
  } catch (error) {
    console.error('Create sub kriteria error:', error);
    res.status(400).json({ 
      message: error.message,
      type: 'validation_error'
    });
  }
};

exports.updateSubKriteria = async (req, res) => {
  try {
    const id = req.params.id;
    const { tipe, skor, deskripsi } = req.body;

    if (!tipe || !skor || !deskripsi) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    await SubKriteria.update(id, {
      tipe,
      skor,
      deskripsi
    });

    const subKriteria = await SubKriteria.findAll();
    res.json({
      message: 'Sub kriteria berhasil diupdate',
      data: subKriteria
    });
  } catch (error) {
    console.error('Update sub kriteria error:', error);
    res.status(400).json({ 
      message: error.message,
      type: 'validation_error'
    });
  }
};

exports.deleteSubKriteria = async (req, res) => {
  try {
    const id = req.params.id;
    await SubKriteria.delete(id);
    res.json({ message: 'Sub kriteria berhasil dihapus' });
  } catch (error) {
    console.error('Delete sub kriteria error:', error);
    res.status(500).json({ message: 'Error deleting sub kriteria' });
  }
};