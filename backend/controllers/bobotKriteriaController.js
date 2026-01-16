// backend/controllers/bobotKriteriaController.js
const BobotKriteria = require('../models/bobotKriteriaModel');
const Kriteria = require('../models/kriteriaModel');
const FuzzyAHP = require('../utils/fuzzyAHP');

exports.getLatestBobot = async (req, res) => {
  try {
    const bobot = await BobotKriteria.findLatest();
    const kriteria = await Kriteria.findAll();

    res.json({
      kriteria,
      bobot
    });
  } catch (error) {
    console.error('Get bobot error:', error);
    res.status(500).json({ message: 'Error getting bobot' });
  }
};

exports.hitungBobot = async (req, res) => {
  try {
      const { matriks_perbandingan } = req.body;
      
      // Validasi input matriks
      if (!Array.isArray(matriks_perbandingan)) {
          return res.status(400).json({ message: 'Invalid matrix format' });
      }

      // Check if bobot already exists
      const existing = await BobotKriteria.findLatest();
      if (existing) {
          return res.status(400).json({ 
              message: 'Bobot sudah dihitung. Gunakan reset untuk menghitung ulang.' 
          });
      }

      const id = await BobotKriteria.create(matriks_perbandingan);
      const result = await BobotKriteria.findLatest();
      const kriteria = await Kriteria.findAll();

      // Kirim response 200 meski tidak konsisten
      res.status(200).json({
          message: result.is_valid 
              ? 'Bobot berhasil dihitung'
              : 'Matriks perbandingan tidak konsisten (CR > 0.1)',
          data: result,
          kriteria,
          is_valid: result.is_valid
      });

  } catch (error) {
      console.error('Hitung bobot error:', error);
      res.status(500).json({ message: 'Error calculating bobot' });
  }
};

exports.resetBobot = async (req, res) => {
  try {
    await BobotKriteria.reset();
    res.json({ message: 'Bobot berhasil direset' });
  } catch (error) {
    console.error('Reset bobot error:', error);
    res.status(500).json({ message: 'Error resetting bobot' });
  }
};