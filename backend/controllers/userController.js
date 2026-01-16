// backend/controllers/userController.js
const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT
        u.id,
        u.nama,
        u.email,
        p.foto_profil,
        p.jabatan_fungsional,
        p.profesi,
        p.jenis_kelamin,
        p.nomor_whatsapp,
        p.alamat,
        p.online_profil,
        p.nip_niy,
        p.nidn,
        p.bidang_ilmu,
        pl.status_peneliti,
        r.status_reviewer
      FROM users u
      LEFT JOIN user_profile p ON u.id = p.user_id
      LEFT JOIN peneliti pl ON u.id = pl.user_id
      LEFT JOIN reviewer r ON u.id = r.user_id
      WHERE u.role = 'User'
      ORDER BY u.nama ASC
    `);
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Gagal memuat User' });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const userId = req.params.id;
    // Get user profile with basic status
    const [users] = await db.execute(`
      SELECT
        u.id,
        u.nama,
        u.email,
        p.foto_profil,
        p.jabatan_fungsional,
        p.profesi,
        p.jenis_kelamin,
        p.nomor_whatsapp,
        p.alamat,
        p.online_profil,
        p.nip_niy,
        p.nidn,
        p.bidang_ilmu,
        pl.status_peneliti,
        r.status_reviewer
      FROM users u
      LEFT JOIN user_profile p ON u.id = p.user_id
      LEFT JOIN peneliti pl ON u.id = pl.user_id
      LEFT JOIN reviewer r ON u.id = r.user_id
      WHERE u.id = ?
    `, [userId]);
    
    if (!users[0]) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get peneliti details including dates
    const [peneliti] = await db.execute(`
      SELECT 
        status_peneliti,
        tanggal_pengajuan,
        tanggal_disetujui,
        catatan_admin
      FROM peneliti 
      WHERE user_id = ?
    `, [userId]);
    
    // Get reviewer details including dates (modified to remove verifikasi)
    const [reviewer] = await db.execute(`
      SELECT
        status_reviewer,
        tanggal_pengajuan,
        tanggal_disetujui,
        catatan_admin
      FROM reviewer
      WHERE user_id = ?
    `, [userId]);
    
    // Get riwayat pendidikan
    const [pendidikan] = await db.execute(`
      SELECT * FROM riwayat_pendidikan
      WHERE user_id = ?
      ORDER BY tahun_lulus DESC
    `, [userId]);
    
    // Get berkas user
    const [berkas] = await db.execute(`
      SELECT * FROM berkas_user
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);
    
    res.json({
      user: users[0],
      peneliti: peneliti[0] || null,
      reviewer: reviewer[0] || null,
      pendidikan,
      berkas
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({ message: 'Error getting user detail' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // Get user data first for file deletion
    const [userProfile] = await db.execute(
      'SELECT foto_profil FROM user_profile WHERE user_id = ?',
      [userId]
    );
    const [userBerkas] = await db.execute(
      'SELECT file_berkas FROM berkas_user WHERE user_id = ?',
      [userId]
    );
    const [userPendidikan] = await db.execute(
      'SELECT file_ijazah FROM riwayat_pendidikan WHERE user_id = ?',
      [userId]
    );
    
    // Delete user
    await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    // Delete associated files
    const deleteFile = async (filename, folder) => {
      if (filename) {
        try {
          await fs.unlink(path.join(__dirname, '..', 'public', 'uploads', folder, filename));
        } catch (error) {
          console.error(`Error deleting file from ${folder}:`, error);
        }
      }
    };
    
    // Delete profile photo
    if (userProfile[0]?.foto_profil) {
      await deleteFile(userProfile[0].foto_profil, 'profile');
    }
    
    // Delete berkas files
    for (const berkas of userBerkas) {
      await deleteFile(berkas.file_berkas, 'berkas');
    }
    
    // Delete ijazah files
    for (const pendidikan of userPendidikan) {
      await deleteFile(pendidikan.file_ijazah, 'ijazah');
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};