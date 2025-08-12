const express = require('express');
const { querySimilarVectorsHandler, upsertVectorHandler } = require('../controllers/vectorController');

const router = express.Router();

router.post('/query', querySimilarVectorsHandler);
router.post('/upsert', upsertVectorHandler);

module.exports = router; 