import express from 'express';
import {
  createCollection,
  getCollections,
  getCollection,
  updateCollection,
  deleteCollection,
  duplicateCollection,
} from '../controllers/collection.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import {
  createCollectionSchema,
  updateCollectionSchema,
} from '../validators/collection.validator.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', validate(createCollectionSchema), createCollection);
router.get('/', getCollections);
router.get('/:id', getCollection);
router.put('/:id', validate(updateCollectionSchema), updateCollection);
router.delete('/:id', deleteCollection);
router.post('/:id/duplicate', duplicateCollection);

export default router;
