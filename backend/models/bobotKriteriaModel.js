// backend/models/bobotKriteriaModel.js
const db = require('../config/database');
const FuzzyAHP = require('../utils/fuzzyAHP');

class BobotKriteria {
  static async findLatest() {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM bobot_kriteria ORDER BY created_at DESC LIMIT 1'
      );
      if (rows[0]) {
        return {
          ...rows[0],
          rasio_konsistensi: Number(rows[0].rasio_konsistensi),
          matriks_perbandingan: JSON.parse(rows[0].matriks_perbandingan),
          hasil_fuzzy: JSON.parse(rows[0].hasil_fuzzy),
          hasil_sintesis: JSON.parse(rows[0].hasil_sintesis),
          hasil_derajat: JSON.parse(rows[0].hasil_derajat),
          bobot_final: JSON.parse(rows[0].bobot_final)
        };
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async create(matriksPerbandingan) {
    try {
        // Hitung semua komponen Fuzzy AHP
        const matriksFuzzy = FuzzyAHP.hitungMatriksFuzzy(matriksPerbandingan);
        const sintesisFuzzy = FuzzyAHP.hitungSintesisFuzzy(matriksFuzzy);
        const derajatKemungkinan = FuzzyAHP.hitungDerajatKemungkinan(sintesisFuzzy);
        const bobotFinal = FuzzyAHP.hitungBobotFinal(derajatKemungkinan);
        const rasioKonsistensi = FuzzyAHP.hitungKonsistensiRasio(matriksPerbandingan);
        const isValid = FuzzyAHP.validasiKonsistensi(rasioKonsistensi);

        // Simpan ke database
        const [result] = await db.execute(
            `INSERT INTO bobot_kriteria (
                matriks_perbandingan,
                hasil_fuzzy,
                hasil_sintesis,
                hasil_derajat,
                bobot_final,
                rasio_konsistensi,
                is_valid
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                JSON.stringify(matriksPerbandingan),
                JSON.stringify(matriksFuzzy),
                JSON.stringify(sintesisFuzzy),
                JSON.stringify(derajatKemungkinan),
                JSON.stringify(bobotFinal),
                rasioKonsistensi,
                isValid
            ]
        );

        // Update bobot di tabel kriteria terlepas dari konsistensi
        const [kriteria] = await db.execute(
            'SELECT id FROM kriteria ORDER BY kode_kriteria ASC'
        );

        // Update bobot untuk setiap kriteria
        for (let i = 0; i < kriteria.length; i++) {
            const bobotPersen = bobotFinal[i] * 100;
            await db.execute(
                'UPDATE kriteria SET bobot = ? WHERE id = ?',
                [bobotPersen, kriteria[i].id]
            );
        }

        return result.insertId;
    } catch (error) {
        throw error;
    }
}

static async reset() {
  try {
      // Reset tabel bobot_kriteria
      await db.execute('TRUNCATE TABLE bobot_kriteria');
      
      // Reset bobot di tabel kriteria
      await db.execute('UPDATE kriteria SET bobot = 0');
      
      return true;
  } catch (error) {
      throw error;
  }
}
}

module.exports = BobotKriteria;