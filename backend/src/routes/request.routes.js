import express from 'express';
import {
  createRequest,
  getRequestsByCollection,
  getRequest,
  updateRequest,
  deleteRequest,
  executeRequest,
  duplicateRequest,
} from '../controllers/request.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import {
  createRequestSchema,
  updateRequestSchema,
  executeRequestSchema,
} from '../validators/request.validator.js';
import { apiExecutionLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', validate(createRequestSchema), createRequest);
router.post('/execute', apiExecutionLimiter, validate(executeRequestSchema), executeRequest);
router.get('/collection/:collectionId', getRequestsByCollection);
router.get('/:id', getRequest);
router.put('/:id', validate(updateRequestSchema), updateRequest);
router.delete('/:id', deleteRequest);
router.post('/:id/duplicate', duplicateRequest);

export default router;
