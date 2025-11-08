import express from 'express';
import {
  createEnvironment,
  getEnvironments,
  getEnvironment,
  getActiveEnvironment,
  updateEnvironment,
  deleteEnvironment,
  activateEnvironment,
} from '../controllers/environment.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import {
  createEnvironmentSchema,
  updateEnvironmentSchema,
} from '../validators/environment.validator.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', validate(createEnvironmentSchema), createEnvironment);
router.get('/', getEnvironments);
router.get('/active', getActiveEnvironment);
router.get('/:id', getEnvironment);
router.put('/:id', validate(updateEnvironmentSchema), updateEnvironment);
router.put('/:id/activate', activateEnvironment);
router.delete('/:id', deleteEnvironment);

export default router;
