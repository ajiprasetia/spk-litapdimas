// backend/models/subKriteriaModel.js
const db = require('../config/database');

class SubKriteria {
  static async findAll() {
    try {
      const [rows] = await db.execute(`
        SELECT sk.*, k.kode_kriteria, k.nama_kriteria, k.bobot
        FROM sub_kriteria sk
        JOIN kriteria k ON sk.kriteria_id = k.id
        ORDER BY k.kode_kriteria ASC, sk.tipe ASC, sk.skor ASC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByKriteria(kriteriaId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM sub_kriteria WHERE kriteria_id = ? ORDER BY tipe ASC, skor ASC',
        [kriteriaId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static validateSkorRange(tipe, skor, bobot) {
    const bobotValue = Math.round(bobot);
    const skorValue = parseFloat(skor);
  
    const ranges = {
      'Low': {
        min: 1,
        max: Math.round(bobotValue / 3)
      },
      'Middle': {
        min: Math.round(bobotValue / 3) + 1,
        max: Math.round(bobotValue * 2 / 3)
      },
      'High': {
        min: Math.round(bobotValue * 2 / 3) + 1,
        max: bobotValue
      }
    };
  
    const range = ranges[tipe];
    return {
      isValid: skorValue >= range.min && skorValue <= range.max,
      min: range.min,
      max: range.max
    };
  }

  static async checkDuplicateSkor(kriteria_id, tipe, skor, excludeId = null) {
    try {
      let query = 'SELECT id FROM sub_kriteria WHERE kriteria_id = ? AND tipe = ? AND skor = ?';
      let params = [kriteria_id, tipe, skor];

      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      const [rows] = await db.execute(query, params);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    const { kriteria_id, tipe, skor, deskripsi } = data;

    try {
      // Get kriteria bobot first
      const [kriteria] = await db.execute(
        'SELECT bobot FROM kriteria WHERE id = ?',
        [kriteria_id]
      );

      if (!kriteria[0]) {
        throw new Error('Kriteria not found');
      }

      // Check for duplicate skor in the same type
      const hasDuplicate = await this.checkDuplicateSkor(kriteria_id, tipe, skor);
      if (hasDuplicate) {
        throw new Error(`Skor ${skor} sudah ada untuk tipe ${tipe} pada kriteria ini`);
      }

      // Validate skor range
      const validation = this.validateSkorRange(tipe, skor, kriteria[0].bobot);
      if (!validation.isValid) {
        throw new Error(`Skor harus berada di antara ${validation.min} dan ${validation.max}`);
      }

      const [result] = await db.execute(
        'INSERT INTO sub_kriteria (kriteria_id, tipe, skor, deskripsi) VALUES (?, ?, ?, ?)',
        [kriteria_id, tipe, skor, deskripsi]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    const { tipe, skor, deskripsi } = data;

    try {
      // Get current sub kriteria data
      const [current] = await db.execute(`
        SELECT sk.*, k.bobot 
        FROM sub_kriteria sk
        JOIN kriteria k ON sk.kriteria_id = k.id
        WHERE sk.id = ?
      `, [id]);

      if (!current[0]) {
        throw new Error('Sub kriteria not found');
      }

      // Check for duplicate skor in the same type
      const hasDuplicate = await this.checkDuplicateSkor(current[0].kriteria_id, tipe, skor, id);
      if (hasDuplicate) {
        throw new Error(`Skor ${skor} sudah ada untuk tipe ${tipe} pada kriteria ini`);
      }

      // Validate skor range
      const validation = this.validateSkorRange(tipe, skor, current[0].bobot);
      if (!validation.isValid) {
        throw new Error(`Skor harus berada di antara ${validation.min} dan ${validation.max}`);
      }

      const [result] = await db.execute(
        'UPDATE sub_kriteria SET tipe = ?, skor = ?, deskripsi = ? WHERE id = ?',
        [tipe, skor, deskripsi, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM sub_kriteria WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SubKriteria;