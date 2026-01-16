// backend/models/klasterModel.js
const db = require('../config/database');

class Klaster {
  static async findAll() {
    try {
      const [rows] = await db.execute(`
        SELECT k.*, ta.tahun_anggaran, ta.status as tahun_status
        FROM klaster k
        LEFT JOIN tahun_anggaran ta ON k.tahun_anggaran_id = ta.id
        ORDER BY ta.tahun_anggaran DESC, k.created_at ASC
      `);
      
      return rows.map(row => ({
        ...row,
        persyaratan_administratif: JSON.parse(row.persyaratan_administratif || '[]'),
        output: JSON.parse(row.output || '[]'),
        outcomes: JSON.parse(row.outcomes || '[]')
      }));
    } catch (error) {
      throw error;
    }
  }

  static async findByTahunAnggaran(tahunAnggaranId) {
    try {
      const [rows] = await db.execute(`
        SELECT k.*, ta.tahun_anggaran, ta.status as tahun_status
        FROM klaster k
        LEFT JOIN tahun_anggaran ta ON k.tahun_anggaran_id = ta.id
        WHERE k.tahun_anggaran_id = ?
        ORDER BY k.created_at ASC
      `, [tahunAnggaranId]);
      
      return rows.map(row => ({
        ...row,
        persyaratan_administratif: JSON.parse(row.persyaratan_administratif || '[]'),
        output: JSON.parse(row.output || '[]'),
        outcomes: JSON.parse(row.outcomes || '[]')
      }));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(`
        SELECT k.*, ta.tahun_anggaran, ta.status as tahun_status
        FROM klaster k
        LEFT JOIN tahun_anggaran ta ON k.tahun_anggaran_id = ta.id
        WHERE k.id = ?
      `, [id]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        ...row,
        persyaratan_administratif: JSON.parse(row.persyaratan_administratif || '[]'),
        output: JSON.parse(row.output || '[]'),
        outcomes: JSON.parse(row.outcomes || '[]')
      };
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    const {
      tahun_anggaran_id,
      nama_klaster,
      kuota_pendanaan,
      persyaratan_administratif,
      output,
      outcomes
    } = data;

    try {
      // Check if tahun_anggaran exists
      if (tahun_anggaran_id) {
        const [tahunCheck] = await db.execute(
          'SELECT id FROM tahun_anggaran WHERE id = ?',
          [tahun_anggaran_id]
        );
        
        if (tahunCheck.length === 0) {
          throw new Error('Tahun anggaran tidak ditemukan');
        }
      }

      const [result] = await db.execute(
        `INSERT INTO klaster 
         (tahun_anggaran_id, nama_klaster, kuota_pendanaan, persyaratan_administratif, output, outcomes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          tahun_anggaran_id || null,
          nama_klaster,
          kuota_pendanaan,
          JSON.stringify(persyaratan_administratif || []),
          JSON.stringify(output || []),
          JSON.stringify(outcomes || [])
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    const {
      tahun_anggaran_id,
      nama_klaster,
      kuota_pendanaan,
      persyaratan_administratif,
      output,
      outcomes
    } = data;

    try {
      // Check if klaster exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error('Klaster tidak ditemukan');
      }

      // Check if tahun_anggaran exists
      if (tahun_anggaran_id) {
        const [tahunCheck] = await db.execute(
          'SELECT id FROM tahun_anggaran WHERE id = ?',
          [tahun_anggaran_id]
        );
        
        if (tahunCheck.length === 0) {
          throw new Error('Tahun anggaran tidak ditemukan');
        }
      }

      const [result] = await db.execute(
        `UPDATE klaster 
         SET tahun_anggaran_id = ?, nama_klaster = ?, kuota_pendanaan = ?, 
             persyaratan_administratif = ?, output = ?, outcomes = ?
         WHERE id = ?`,
        [
          tahun_anggaran_id || null,
          nama_klaster,
          kuota_pendanaan,
          JSON.stringify(persyaratan_administratif || []),
          JSON.stringify(output || []),
          JSON.stringify(outcomes || []),
          id
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Check if klaster is being used in proposals
      const [proposalCheck] = await db.execute(
        'SELECT COUNT(*) as count FROM proposal WHERE klaster_id = ?',
        [id]
      );
      
      if (proposalCheck[0].count > 0) {
        throw new Error('Klaster tidak dapat dihapus karena masih digunakan dalam proposal');
      }

      const [result] = await db.execute('DELETE FROM klaster WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async findByActiveTahunAnggaran() {
    try {
      const [rows] = await db.execute(`
        SELECT k.*, ta.tahun_anggaran, ta.status as tahun_status
        FROM klaster k
        JOIN tahun_anggaran ta ON k.tahun_anggaran_id = ta.id
        WHERE ta.status = 'Aktif'
        ORDER BY k.created_at ASC
      `);
      
      return rows.map(row => ({
        ...row,
        persyaratan_administratif: JSON.parse(row.persyaratan_administratif || '[]'),
        output: JSON.parse(row.output || '[]'),
        outcomes: JSON.parse(row.outcomes || '[]')
      }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Klaster;