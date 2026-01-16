// backend/models/kriteriaModel.js
const db = require('../config/database');

class Kriteria {
  static async findAll() {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM kriteria ORDER BY CAST(SUBSTRING(kode_kriteria, 2) AS UNSIGNED) ASC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM kriteria WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    const { kode_kriteria, nama_kriteria } = data;

    try {
      // Check if kode_kriteria already exists
      const [existing] = await db.execute(
        'SELECT id FROM kriteria WHERE kode_kriteria = ?',
        [kode_kriteria]
      );

      if (existing.length > 0) {
        throw new Error('Kode kriteria sudah digunakan');
      }

      const [result] = await db.execute(
        'INSERT INTO kriteria (kode_kriteria, nama_kriteria) VALUES (?, ?)',
        [kode_kriteria, nama_kriteria]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    const { kode_kriteria, nama_kriteria } = data;

    try {
      // Check if kode_kriteria already exists (excluding current id)
      const [existing] = await db.execute(
        'SELECT id FROM kriteria WHERE kode_kriteria = ? AND id != ?',
        [kode_kriteria, id]
      );

      if (existing.length > 0) {
        throw new Error('Kode kriteria sudah digunakan');
      }

      const [result] = await db.execute(
        'UPDATE kriteria SET kode_kriteria = ?, nama_kriteria = ? WHERE id = ?',
        [kode_kriteria, nama_kriteria, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute(
        'DELETE FROM kriteria WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getNextKodeKriteria() {
    try {
      const [rows] = await db.execute(
        'SELECT kode_kriteria FROM kriteria ORDER BY CAST(SUBSTRING(kode_kriteria, 2) AS UNSIGNED) DESC LIMIT 1'
      );
      
      if (rows.length === 0) {
        return 'K1';
      }

      const lastKode = rows[0].kode_kriteria;
      const lastNumber = parseInt(lastKode.substring(1));
      return `K${lastNumber + 1}`;
    } catch (error) {
      throw error;
    }
  }

  static async updateBobot(id, bobot) {
    try {
      const [result] = await db.execute(
        'UPDATE kriteria SET bobot = ? WHERE id = ?',
        [bobot, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getTotalBobot() {
    try {
      const [rows] = await db.execute(
        'SELECT COALESCE(SUM(bobot), 0) as total_bobot FROM kriteria'
      );
      return rows[0].total_bobot;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Kriteria;