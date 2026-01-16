// backend/models/userModel.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT id, nama, email, role FROM users WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    const { nama, email, password, role = 'User' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const [result] = await db.execute(
        'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
        [nama, email, hashedPassword, role]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    try {
      const [result] = await db.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;