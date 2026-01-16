// backend/routes/kriteriaRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const kriteriaController = require('../controllers/kriteriaController');

router.get('/', verifyToken, kriteriaController.getAllKriteria);
router.get('/next-kode', verifyToken, verifyAdmin, kriteriaController.getNextKodeKriteria);
router.get('/:id', verifyToken, kriteriaController.getKriteriaById);
router.post('/', verifyToken, verifyAdmin, kriteriaController.createKriteria);
router.put('/:id', verifyToken, verifyAdmin, kriteriaController.updateKriteria);
router.delete('/:id', verifyToken, verifyAdmin, kriteriaController.deleteKriteria);

module.exports = router;