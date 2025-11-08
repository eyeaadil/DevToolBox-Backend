import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { Request, Collection, History } from '../models/index.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import axios from 'axios';

// @desc    Create new request
// @route   POST /api/v1/requests
// @access  Private
export const createRequest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { collectionId, name, method, url, headers, queryParams, body, bodyType, auth, description, order } = req.body;

  // Verify collection belongs to user
  const collection = await Collection.findOne({ _id: collectionId, userId });
  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  const request = await Request.create({
    userId,
    collectionId,
    name,
    method,
    url,
    headers,
    queryParams,
    body,
    bodyType,
    auth,
    description,
    order,
  });

  // Increment collection request count
  await collection.incrementRequestCount();

  successResponse(res, { request }, 'Request created successfully', 201);
});

// @desc    Get requests by collection
// @route   GET /api/v1/requests/collection/:collectionId
// @access  Private
export const getRequestsByCollection = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  const userId = req.user.id;

  // Verify collection belongs to user
  const collection = await Collection.findOne({ _id: collectionId, userId });
  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  const requests = await Request.find({ collectionId, userId }).sort({ order: 1, createdAt: -1 });

  successResponse(res, { requests }, 'Requests retrieved successfully');
});

// @desc    Get single request
// @route   GET /api/v1/requests/:id
// @access  Private
export const getRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const request = await Request.findOne({ _id: id, userId });

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  successResponse(res, { request }, 'Request retrieved successfully');
});

// @desc    Update request
// @route   PUT /api/v1/requests/:id
// @access  Private
export const updateRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const updates = req.body;

  const request = await Request.findOneAndUpdate(
    { _id: id, userId },
    updates,
    { new: true, runValidators: true }
  );

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  successResponse(res, { request }, 'Request updated successfully');
});

// @desc    Delete request
// @route   DELETE /api/v1/requests/:id
// @access  Private
export const deleteRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const request = await Request.findOne({ _id: id, userId });

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  // Decrement collection request count
  const collection = await Collection.findById(request.collectionId);
  if (collection) {
    await collection.decrementRequestCount();
  }

  await request.deleteOne();

  successResponse(res, null, 'Request deleted successfully');
});

// @desc    Execute API request (Proxy)
// @route   POST /api/v1/requests/execute
// @access  Private
export const executeRequest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { method, url, headers = {}, body, timeout = 30000, requestId } = req.body;

  const startTime = Date.now();

  try {
    // Prepare axios config
    const config = {
      method: method.toLowerCase(),
      url,
      headers,
      timeout,
      validateStatus: () => true, // Don't throw on any status code
    };

    // Add body for methods that support it
    if (['post', 'put', 'patch'].includes(config.method) && body) {
      config.data = body;
    }

    // Execute the request
    const response = await axios(config);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Calculate response size
    const responseSize = JSON.stringify(response.data).length;

    // Prepare response data
    const responseData = {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      time: responseTime,
      size: responseSize,
    };

    // Save to history
    await History.create({
      userId,
      requestId: requestId || null,
      method,
      url,
      headers,
      body,
      response: responseData,
      executedAt: new Date(),
    });

    successResponse(res, responseData, 'Request executed successfully');
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Save error to history
    await History.create({
      userId,
      requestId: requestId || null,
      method,
      url,
      headers,
      body,
      error: {
        message: error.message,
        code: error.code,
      },
      executedAt: new Date(),
    });

    throw new AppError(`Request failed: ${error.message}`, 500);
  }
});

// @desc    Duplicate request
// @route   POST /api/v1/requests/:id/duplicate
// @access  Private
export const duplicateRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const originalRequest = await Request.findOne({ _id: id, userId });

  if (!originalRequest) {
    throw new AppError('Request not found', 404);
  }

  // Create duplicate
  const duplicateData = originalRequest.toObject();
  delete duplicateData._id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;
  duplicateData.name = `${duplicateData.name} (Copy)`;

  const newRequest = await Request.create(duplicateData);

  // Increment collection request count
  const collection = await Collection.findById(newRequest.collectionId);
  if (collection) {
    await collection.incrementRequestCount();
  }

  successResponse(res, { request: newRequest }, 'Request duplicated successfully', 201);
});
