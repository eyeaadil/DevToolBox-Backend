import express from 'express';
import {
  getHistory,
  getHistoryEntry,
  deleteHistoryEntry,
  clearHistory,
  getHistoryStats,
} from '../controllers/history.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getHistory);
router.get('/stats', getHistoryStats);
router.get('/:id', getHistoryEntry);
router.delete('/:id', deleteHistoryEntry);
router.delete('/', clearHistory);

export default router;
