// backend/models/berkasUserModel.js
const db = require('../config/database');

class BerkasUser {
    static async findAllByUserId(userId) {
      try {
        const [rows] = await db.execute(
          'SELECT * FROM berkas_user WHERE user_id = ? ORDER BY created_at ASC', // Ubah dari DESC ke ASC
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
        'SELECT * FROM berkas_user WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(userId, namaBerkas, fileBerkas) {
    try {
      const [result] = await db.execute(
        'INSERT INTO berkas_user (user_id, nama_berkas, file_berkas) VALUES (?, ?, ?)',
        [userId, namaBerkas, fileBerkas]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, namaBerkas, fileBerkas = null) {
    try {
      if (fileBerkas) {
        const [result] = await db.execute(
          'UPDATE berkas_user SET nama_berkas = ?, file_berkas = ? WHERE id = ?',
          [namaBerkas, fileBerkas, id]
        );
        return result.affectedRows > 0;
      } else {
        const [result] = await db.execute(
          'UPDATE berkas_user SET nama_berkas = ? WHERE id = ?',
          [namaBerkas, id]
        );
        return result.affectedRows > 0;
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute(
        'DELETE FROM berkas_user WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BerkasUser;