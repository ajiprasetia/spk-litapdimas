// backend/models/userProfileModel.js
const db = require('../config/database');

class UserProfile {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM user_profile WHERE user_id = ?',
        [userId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(profileData) {
    const {
      user_id,
      foto_profil,
      jenis_kelamin,
      nomor_whatsapp,
      alamat,
      online_profil,
      profesi,
      nip_niy,
      nidn,
      jabatan_fungsional,
      bidang_ilmu
    } = profileData;

    try {
      const [result] = await db.execute(
        `INSERT INTO user_profile (
          user_id, foto_profil, jenis_kelamin, nomor_whatsapp, 
          alamat, online_profil, profesi, nip_niy, nidn, 
          jabatan_fungsional, bidang_ilmu
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id, foto_profil, jenis_kelamin, nomor_whatsapp,
          alamat, online_profil, profesi, nip_niy, nidn,
          jabatan_fungsional, bidang_ilmu
        ]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(userId, profileData) {
    const {
      foto_profil,
      jenis_kelamin,
      nomor_whatsapp,
      alamat,
      online_profil,
      profesi,
      nip_niy,
      nidn,
      jabatan_fungsional,
      bidang_ilmu
    } = profileData;

    try {
      const [result] = await db.execute(
        `UPDATE user_profile SET
          foto_profil = ?,
          jenis_kelamin = ?,
          nomor_whatsapp = ?,
          alamat = ?,
          online_profil = ?,
          profesi = ?,
          nip_niy = ?,
          nidn = ?,
          jabatan_fungsional = ?,
          bidang_ilmu = ?
        WHERE user_id = ?`,
        [
          foto_profil,
          jenis_kelamin,
          nomor_whatsapp,
          alamat,
          online_profil,
          profesi,
          nip_niy,
          nidn,
          jabatan_fungsional,
          bidang_ilmu,
          userId
        ]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateFotoProfil(userId, fotoPath) {
    try {
      const [result] = await db.execute(
        'UPDATE user_profile SET foto_profil = ? WHERE user_id = ?',
        [fotoPath, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserProfile;