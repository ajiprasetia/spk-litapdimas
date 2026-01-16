// backend/controllers/riwayatLoginController.js
const RiwayatLogin = require('../models/riwayatLoginModel');

exports.getRiwayatLogin = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    
    const riwayat = await RiwayatLogin.findByUserId(userId, limit);
    
    // Transform data untuk tampilan
    const formattedRiwayat = riwayat.map(item => {
      // Calculate time ago
      const timeAgo = getTimeAgo(new Date(item.login_time));
      
      return {
        id: item.id,
        device: item.device_info,
        ipAddress: item.ip_address,
        time: timeAgo,
        loginTime: new Date(item.login_time).toLocaleString(),
        status: item.status
      };
    });
    
    res.json(formattedRiwayat);
  } catch (error) {
    console.error('Get riwayat login error:', error);
    res.status(500).json({
      message: 'Error getting login history'
    });
  }
};

exports.recordLogin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Record the login
    await RiwayatLogin.create(userId, ipAddress, userAgent);
    
    // Clean up old records to keep storage optimized
    await RiwayatLogin.deleteOldRecords(userId);
    
    // If this is middleware, continue to the next function
    if (next) next();
  } catch (error) {
    console.error('Record login error:', error);
    
    // Don't fail the request if recording login fails
    if (next) next();
    else res.status(500).json({ message: 'Error recording login' });
  }
};

// Helper function to get time ago in human readable format
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + ' tahun yang lalu';
  if (interval === 1) return 'setahun yang lalu';
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + ' bulan yang lalu';
  if (interval === 1) return 'sebulan yang lalu';
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + ' hari yang lalu';
  if (interval === 1) return 'kemarin';
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + ' jam yang lalu';
  if (interval === 1) return '1 jam yang lalu';
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + ' menit yang lalu';
  if (interval === 1) return '1 menit yang lalu';
  
  if (seconds < 10) return 'baru saja';
  
  return Math.floor(seconds) + ' detik yang lalu';
}

module.exports.recordLoginMiddleware = (req, res, next) => {
  // Skip if not authenticated
  if (!req.user) return next();
  
  // Record login but don't wait for it
  this.recordLogin(req, res, next);
};