import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { Environment } from '../models/index.js';
import { successResponse } from '../utils/response.js';

// @desc    Create new environment
// @route   POST /api/v1/environments
// @access  Private
export const createEnvironment = asyncHandler(async (req, res) => {
  const { name, variables, isActive } = req.body;
  const userId = req.user.id;

  const environment = await Environment.create({
    userId,
    name,
    variables,
    isActive,
  });

  successResponse(res, { environment }, 'Environment created successfully', 201);
});

// @desc    Get all user environments
// @route   GET /api/v1/environments
// @access  Private
export const getEnvironments = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const environments = await Environment.find({ userId }).sort({ createdAt: -1 });

  successResponse(res, { environments }, 'Environments retrieved successfully');
});

// @desc    Get single environment
// @route   GET /api/v1/environments/:id
// @access  Private
export const getEnvironment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const environment = await Environment.findOne({ _id: id, userId });

  if (!environment) {
    throw new AppError('Environment not found', 404);
  }

  successResponse(res, { environment }, 'Environment retrieved successfully');
});

// @desc    Get active environment
// @route   GET /api/v1/environments/active
// @access  Private
export const getActiveEnvironment = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const environment = await Environment.findOne({ userId, isActive: true });

  if (!environment) {
    return successResponse(res, { environment: null }, 'No active environment found');
  }

  successResponse(res, { environment }, 'Active environment retrieved successfully');
});

// @desc    Update environment
// @route   PUT /api/v1/environments/:id
// @access  Private
export const updateEnvironment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const updates = req.body;

  const environment = await Environment.findOneAndUpdate(
    { _id: id, userId },
    updates,
    { new: true, runValidators: true }
  );

  if (!environment) {
    throw new AppError('Environment not found', 404);
  }

  successResponse(res, { environment }, 'Environment updated successfully');
});

// @desc    Delete environment
// @route   DELETE /api/v1/environments/:id
// @access  Private
export const deleteEnvironment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const environment = await Environment.findOne({ _id: id, userId });

  if (!environment) {
    throw new AppError('Environment not found', 404);
  }

  await environment.deleteOne();

  successResponse(res, null, 'Environment deleted successfully');
});

// @desc    Set active environment
// @route   PUT /api/v1/environments/:id/activate
// @access  Private
export const activateEnvironment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const environment = await Environment.findOne({ _id: id, userId });

  if (!environment) {
    throw new AppError('Environment not found', 404);
  }

  // Deactivate all other environments
  await Environment.updateMany({ userId, _id: { $ne: id } }, { isActive: false });

  // Activate this environment
  environment.isActive = true;
  await environment.save();

  successResponse(res, { environment }, 'Environment activated successfully');
});
