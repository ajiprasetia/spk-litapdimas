// backend/routes/subKriteriaRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const subKriteriaController = require('../controllers/subKriteriaController');

router.get('/', verifyToken, subKriteriaController.getAllSubKriteria);
router.get('/kriteria/:kriteriaId', verifyToken, subKriteriaController.getByKriteria);
router.post('/', verifyToken, verifyAdmin, subKriteriaController.createSubKriteria);
router.put('/:id', verifyToken, verifyAdmin, subKriteriaController.updateSubKriteria);
router.delete('/:id', verifyToken, verifyAdmin, subKriteriaController.deleteSubKriteria);

module.exports = router;