// backend/models/riwayatLoginModel.js
const db = require('../config/database');

class RiwayatLogin {
  static async create(userId, ipAddress, userAgent) {
    try {
      // Extract device info from user agent
      const deviceInfo = this.extractDeviceInfo(userAgent);
      
      const [result] = await db.execute(
        `INSERT INTO riwayat_login (user_id, ip_address, user_agent, device_info, status) 
         VALUES (?, ?, ?, ?, 'success')`,
        [userId, ipAddress, userAgent, deviceInfo]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId, limit = 5) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM riwayat_login 
         WHERE user_id = ? 
         ORDER BY login_time DESC 
         LIMIT ?`,
        [userId, limit]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async deleteOldRecords(userId, keepCount = 10) {
    try {
      const [rows] = await db.execute(
        `SELECT id FROM riwayat_login 
         WHERE user_id = ? 
         ORDER BY login_time DESC 
         LIMIT 1 OFFSET ?`,
        [userId, keepCount - 1]
      );

      if (rows.length > 0) {
        const oldestIdToKeep = rows[0].id;
        await db.execute(
          `DELETE FROM riwayat_login 
           WHERE user_id = ? AND id < ?`,
          [userId, oldestIdToKeep]
        );
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Helper method to extract device info from user agent
  static extractDeviceInfo(userAgent) {
    let deviceInfo = 'Unknown Device';
    
    // Extract browser - perhatikan urutan pengecekan sangat penting!
    // Edge harus dicek sebelum Chrome karena user agent Edge mengandung "Chrome"
    if (userAgent.includes('Edg/') || userAgent.includes('Edge/')) {
      deviceInfo = 'Edge';
    } else if (userAgent.includes('OPR/') || userAgent.includes('Opera')) {
      deviceInfo = 'Opera';
    } else if (userAgent.includes('Firefox/')) {
      deviceInfo = 'Firefox';
    } else if (userAgent.includes('Chrome/')) {
      deviceInfo = 'Chrome';
    } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
      deviceInfo = 'Safari';
    }
    
    // Extract OS
    if (userAgent.includes('Windows')) {
      deviceInfo += ' on Windows';
    } else if (userAgent.includes('Macintosh')) {
      deviceInfo += ' on Mac';
    } else if (userAgent.includes('Linux') && !userAgent.includes('Android')) {
      deviceInfo += ' on Linux';
    } else if (userAgent.includes('Android')) {
      deviceInfo += ' on Android';
    } else if (userAgent.includes('iPhone')) {
      deviceInfo += ' on iPhone';
    } else if (userAgent.includes('iPad')) {
      deviceInfo += ' on iPad';
    }
    
    return deviceInfo;
  }
}

module.exports = RiwayatLogin;