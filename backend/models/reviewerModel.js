// backend/models/reviewerModel.js
const db = require('../config/database');

class Reviewer {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM reviewer WHERE user_id = ?',
        [userId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async checkEligibility(userId) {
    try {
      // Check peneliti status
      const [peneliti] = await db.execute(
        'SELECT status_peneliti FROM peneliti WHERE user_id = ?',
        [userId]
      );
      if (!peneliti[0] || peneliti[0].status_peneliti !== 'Terdaftar') {
        return {
          eligible: false,
          message: 'Anda harus terdaftar sebagai Peneliti terlebih dahulu'
        };
      }

      // Check jabatan fungsional
      const [profil] = await db.execute(
        'SELECT jabatan_fungsional FROM user_profile WHERE user_id = ?',
        [userId]
      );

      if (!profil[0] || !['Lektor', 'Lektor Kepala', 'Guru Besar'].includes(profil[0].jabatan_fungsional)) {
        return {
          eligible: false,
          message: 'Jabatan fungsional minimal harus Lektor'
        };
      }

      // Check pendidikan S3
      const [pendidikan] = await db.execute(
        'SELECT jenjang FROM riwayat_pendidikan WHERE user_id = ? AND jenjang = "S3"',
        [userId]
      );
      if (!pendidikan[0]) {
        return {
          eligible: false,
          message: 'Pendidikan minimal harus S3'
        };
      }

      return {
        eligible: true,
        message: 'Anda memenuhi syarat untuk mendaftar sebagai Reviewer'
      };
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.execute(`
        SELECT r.*, u.nama, u.email
        FROM reviewer r
        JOIN users u ON r.user_id = u.id
        ORDER BY 
          CASE 
            WHEN r.status_reviewer = 'Menunggu Persetujuan' THEN 1
            WHEN r.status_reviewer = 'Revisi Pengajuan' THEN 2
            WHEN r.status_reviewer = 'Terdaftar' THEN 3
            ELSE 4
          END,
          r.tanggal_pengajuan DESC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(userId) {
    try {
      const [result] = await db.execute(
        `INSERT INTO reviewer (
          user_id,
          status_reviewer,
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
      status_reviewer,
      catatan_admin,
      tanggal_disetujui
    } = data;
    
    try {
      const [result] = await db.execute(
        `UPDATE reviewer
        SET status_reviewer = ?,
            catatan_admin = ?,
            tanggal_disetujui = ?
        WHERE user_id = ?`,
        [
          status_reviewer,
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
        `UPDATE reviewer
        SET status_reviewer = 'Menunggu Persetujuan',
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

module.exports = Reviewer;