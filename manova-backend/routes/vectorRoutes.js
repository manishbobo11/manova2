import express from 'express';
import { querySimilarVectorsHandler, upsertVectorHandler } from '../controllers/vectorController.js';

const router = express.Router();

router.post('/query', querySimilarVectorsHandler);
router.post('/upsert', upsertVectorHandler);

export default router; 