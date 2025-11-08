import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { History } from '../models/index.js';
import { successResponse, paginatedResponse } from '../utils/response.js';

// @desc    Get user history
// @route   GET /api/v1/history
// @access  Private
export const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, method, search } = req.query;

  const query = { userId };

  // Filter by method if provided
  if (method) {
    query.method = method.toUpperCase();
  }

  // Search in URL if provided
  if (search) {
    query.url = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    History.find(query)
      .sort({ executedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('requestId', 'name method url'),
    History.countDocuments(query),
  ]);

  paginatedResponse(res, history, page, limit, total, 'History retrieved successfully');
});

// @desc    Get single history entry
// @route   GET /api/v1/history/:id
// @access  Private
export const getHistoryEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const historyEntry = await History.findOne({ _id: id, userId }).populate('requestId', 'name method url');

  if (!historyEntry) {
    throw new AppError('History entry not found', 404);
  }

  successResponse(res, { history: historyEntry }, 'History entry retrieved successfully');
});

// @desc    Delete history entry
// @route   DELETE /api/v1/history/:id
// @access  Private
export const deleteHistoryEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const historyEntry = await History.findOne({ _id: id, userId });

  if (!historyEntry) {
    throw new AppError('History entry not found', 404);
  }

  await historyEntry.deleteOne();

  successResponse(res, null, 'History entry deleted successfully');
});

// @desc    Clear all history
// @route   DELETE /api/v1/history
// @access  Private
export const clearHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await History.deleteMany({ userId });

  successResponse(res, { deletedCount: result.deletedCount }, 'History cleared successfully');
});

// @desc    Get history statistics
// @route   GET /api/v1/history/stats
// @access  Private
export const getHistoryStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await History.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
        avgTime: { $avg: '$response.time' },
      },
    },
  ]);

  const totalRequests = await History.countDocuments({ userId });

  successResponse(
    res,
    {
      totalRequests,
      byMethod: stats,
    },
    'History statistics retrieved successfully'
  );
});
