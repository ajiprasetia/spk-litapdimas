// backend/models/penelitiModel.js
const db = require('../config/database');

class Peneliti {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM peneliti WHERE user_id = ?',
        [userId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, u.nama, u.email
        FROM peneliti p
        JOIN users u ON p.user_id = u.id
        ORDER BY 
          CASE 
            WHEN p.status_peneliti = 'Menunggu Persetujuan' THEN 1
            WHEN p.status_peneliti = 'Revisi Pengajuan' THEN 2
            WHEN p.status_peneliti = 'Terdaftar' THEN 3
            ELSE 4
          END,
          p.tanggal_pengajuan DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(userId) {
    try {
      const [result] = await db.execute(
        `INSERT INTO peneliti (
          user_id,
          status_peneliti,
          tanggal_pengajuan
        ) VALUES (?, 'Menunggu Persetujuan', NOW())`,
        [userId]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(userId, data) {
    const {
      status_peneliti,
      catatan_admin,
      tanggal_disetujui
    } = data;

    try {
      const [result] = await db.execute(
        `UPDATE peneliti
        SET status_peneliti = ?,
            catatan_admin = ?,
            tanggal_disetujui = ?
        WHERE user_id = ?`,
        [
          status_peneliti,
          catatan_admin,
          tanggal_disetujui,
          userId
        ]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async submitRevision(userId) {
    try {
      const [result] = await db.execute(
        `UPDATE peneliti
        SET status_peneliti = 'Menunggu Persetujuan',
            catatan_admin = NULL
        WHERE user_id = ?`,
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Peneliti;