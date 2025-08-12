const express = require('express');
const { querySimilarVectorsHandler, upsertVectorHandler } = require('../controllers/vectorController.cjs');

const router = express.Router();

router.post('/query', querySimilarVectorsHandler);
router.post('/upsert', upsertVectorHandler);

module.exports = router; 