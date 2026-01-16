// backend/models/riwayatPendidikanModel.js
const db = require('../config/database');

class RiwayatPendidikan {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM riwayat_pendidikan WHERE user_id = ? ORDER BY created_at ASC',
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM riwayat_pendidikan WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    const {
      user_id,
      jenjang,
      program_studi,
      perguruan_tinggi,
      tahun_lulus,
      file_ijazah
    } = data;

    try {
      const [result] = await db.execute(
        `INSERT INTO riwayat_pendidikan (
          user_id, jenjang, program_studi, perguruan_tinggi, 
          tahun_lulus, file_ijazah
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          jenjang,
          program_studi,
          perguruan_tinggi,
          tahun_lulus,
          file_ijazah
        ]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    const {
      jenjang,
      program_studi,
      perguruan_tinggi,
      tahun_lulus,
      file_ijazah
    } = data;

    try {
      const [result] = await db.execute(
        `UPDATE riwayat_pendidikan SET
          jenjang = ?,
          program_studi = ?,
          perguruan_tinggi = ?,
          tahun_lulus = ?,
          ${file_ijazah ? 'file_ijazah = ?,' : ''}
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        file_ijazah
          ? [jenjang, program_studi, perguruan_tinggi, tahun_lulus, file_ijazah, id]
          : [jenjang, program_studi, perguruan_tinggi, tahun_lulus, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute(
        'DELETE FROM riwayat_pendidikan WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RiwayatPendidikan;