import express from 'express';
import { 
  formatCodeHandler, 
  getSupportedLanguages, 
  getDefaultOptions 
} from '../controllers/codeFormatter.controller.js';

const router = express.Router();

// Public routes (no authentication required for code formatting)
router.post('/format', formatCodeHandler);
router.get('/languages', getSupportedLanguages);
router.get('/options/:language', getDefaultOptions);

export default router;
