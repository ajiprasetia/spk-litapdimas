// backend/models/tahunAnggaranModel.js
const db = require('../config/database');

class TahunAnggaran {
  static async findAll() {
    try {
      const [rows] = await db.execute(
        `SELECT id, tahun_anggaran, total_anggaran, 
         DATE_FORMAT(tanggal_mulai, '%Y-%m-%d') as tanggal_mulai,
         DATE_FORMAT(tanggal_selesai, '%Y-%m-%d') as tanggal_selesai,
         status, deskripsi, created_at, updated_at
         FROM tahun_anggaran ORDER BY tahun_anggaran DESC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        `SELECT id, tahun_anggaran, total_anggaran, 
         DATE_FORMAT(tanggal_mulai, '%Y-%m-%d') as tanggal_mulai,
         DATE_FORMAT(tanggal_selesai, '%Y-%m-%d') as tanggal_selesai,
         status, deskripsi, created_at, updated_at
         FROM tahun_anggaran WHERE id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByTahun(tahun) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM tahun_anggaran WHERE tahun_anggaran = ?',
        [tahun]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    const { 
      tahun_anggaran, 
      total_anggaran, 
      tanggal_mulai, 
      tanggal_selesai, 
      deskripsi 
    } = data;

    try {
      // Check if year already exists
      const existing = await this.findByTahun(tahun_anggaran);
      if (existing) {
        throw new Error('Tahun anggaran sudah ada');
      }

      // Determine status based on dates
      const currentDate = new Date();
      const startDate = new Date(tanggal_mulai);
      const endDate = new Date(tanggal_selesai);
      
      let status = 'Aktif';
      if (currentDate > endDate) {
        status = 'Selesai';
      }

      const [result] = await db.execute(
        `INSERT INTO tahun_anggaran 
         (tahun_anggaran, total_anggaran, tanggal_mulai, tanggal_selesai, status, deskripsi) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [tahun_anggaran, total_anggaran, tanggal_mulai, tanggal_selesai, status, deskripsi]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    const { 
      tahun_anggaran, 
      total_anggaran, 
      tanggal_mulai, 
      tanggal_selesai, 
      deskripsi 
    } = data;

    try {
      // Check if exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error('Tahun anggaran tidak ditemukan');
      }

      // Check if year already exists (excluding current record)
      const [yearCheck] = await db.execute(
        'SELECT id FROM tahun_anggaran WHERE tahun_anggaran = ? AND id != ?',
        [tahun_anggaran, id]
      );
      
      if (yearCheck.length > 0) {
        throw new Error('Tahun anggaran sudah ada');
      }

      // Determine status based on dates
      const currentDate = new Date();
      const startDate = new Date(tanggal_mulai);
      const endDate = new Date(tanggal_selesai);
      
      let status = 'Aktif';
      if (currentDate > endDate) {
        status = 'Selesai';
      }

      const [result] = await db.execute(
        `UPDATE tahun_anggaran 
         SET tahun_anggaran = ?, total_anggaran = ?, tanggal_mulai = ?, 
             tanggal_selesai = ?, status = ?, deskripsi = ? 
         WHERE id = ?`,
        [tahun_anggaran, total_anggaran, tanggal_mulai, tanggal_selesai, status, deskripsi, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute(
        'DELETE FROM tahun_anggaran WHERE id = ?', 
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateAllStatus() {
    try {
      // Update all records based on current date
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Set to 'Selesai' if current date is past end date
      await db.execute(
        `UPDATE tahun_anggaran 
         SET status = 'Selesai' 
         WHERE tanggal_selesai < ? AND status = 'Aktif'`,
        [currentDate]
      );

      // Set to 'Aktif' if current date is within the period
      await db.execute(
        `UPDATE tahun_anggaran 
         SET status = 'Aktif' 
         WHERE tanggal_mulai <= ? AND tanggal_selesai >= ? AND status = 'Selesai'`,
        [currentDate, currentDate]
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getActiveYear() {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      
      const [rows] = await db.execute(
        `SELECT id, tahun_anggaran, total_anggaran, 
         DATE_FORMAT(tanggal_mulai, '%Y-%m-%d') as tanggal_mulai,
         DATE_FORMAT(tanggal_selesai, '%Y-%m-%d') as tanggal_selesai,
         status, deskripsi, created_at, updated_at
         FROM tahun_anggaran 
         WHERE tanggal_mulai <= ? AND tanggal_selesai >= ? 
         ORDER BY tahun_anggaran DESC LIMIT 1`,
        [currentDate, currentDate]
      );
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TahunAnggaran;