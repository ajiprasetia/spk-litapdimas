// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Storage untuk foto profil
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/profile');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage untuk ijazah
const ijazahStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/ijazah');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ijazah-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage untuk berkas user
const berkasStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/berkas');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'berkas-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage untuk proposal dan RAB
const proposalStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan folder berdasarkan field name
    let folder = 'proposal';
    if (file.fieldname === 'file_rab') {
      folder = 'rab';
    }
    cb(null, `public/uploads/${folder}`);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'file_rab' ? 'rab-' : 'proposal-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter untuk PDF
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// File filter untuk images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

// Export configurasi upload
const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadIjazah = multer({
  storage: ijazahStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadBerkas = multer({
  storage: berkasStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadProposal = multer({
  storage: proposalStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = {
  uploadProfile,
  uploadIjazah,
  uploadBerkas,
  uploadProposal
};