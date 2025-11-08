import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { Collection, Request } from '../models/index.js';
import { successResponse, paginatedResponse } from '../utils/response.js';

// @desc    Create new collection
// @route   POST /api/v1/collections
// @access  Private
export const createCollection = asyncHandler(async (req, res) => {
  const { name, description, color, icon, isPublic } = req.body;
  const userId = req.user.id;

  const collection = await Collection.create({
    userId,
    name,
    description,
    color,
    icon,
    isPublic,
  });

  successResponse(res, { collection }, 'Collection created successfully', 201);
});

// @desc    Get all user collections
// @route   GET /api/v1/collections
// @access  Private
export const getCollections = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, search } = req.query;

  const query = { userId };

  // Add search filter if provided
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [collections, total] = await Promise.all([
    Collection.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Collection.countDocuments(query),
  ]);

  paginatedResponse(res, collections, page, limit, total, 'Collections retrieved successfully');
});

// @desc    Get single collection with requests
// @route   GET /api/v1/collections/:id
// @access  Private
export const getCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const collection = await Collection.findOne({ _id: id, userId });

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  // Get all requests in this collection
  const requests = await Request.find({ collectionId: id, userId }).sort({ order: 1, createdAt: -1 });

  successResponse(
    res,
    {
      collection,
      requests,
    },
    'Collection retrieved successfully'
  );
});

// @desc    Update collection
// @route   PUT /api/v1/collections/:id
// @access  Private
export const updateCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const updates = req.body;

  const collection = await Collection.findOneAndUpdate(
    { _id: id, userId },
    updates,
    { new: true, runValidators: true }
  );

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  successResponse(res, { collection }, 'Collection updated successfully');
});

// @desc    Delete collection
// @route   DELETE /api/v1/collections/:id
// @access  Private
export const deleteCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const collection = await Collection.findOne({ _id: id, userId });

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  // Delete all requests in this collection
  await Request.deleteMany({ collectionId: id, userId });

  // Delete the collection
  await collection.deleteOne();

  successResponse(res, null, 'Collection and all its requests deleted successfully');
});

// @desc    Duplicate collection
// @route   POST /api/v1/collections/:id/duplicate
// @access  Private
export const duplicateCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const originalCollection = await Collection.findOne({ _id: id, userId });

  if (!originalCollection) {
    throw new AppError('Collection not found', 404);
  }

  // Create duplicate collection
  const duplicateData = originalCollection.toObject();
  delete duplicateData._id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;
  duplicateData.name = `${duplicateData.name} (Copy)`;
  duplicateData.requestCount = 0;

  const newCollection = await Collection.create(duplicateData);

  // Duplicate all requests
  const originalRequests = await Request.find({ collectionId: id, userId });

  if (originalRequests.length > 0) {
    const duplicateRequests = originalRequests.map((req) => {
      const reqData = req.toObject();
      delete reqData._id;
      delete reqData.createdAt;
      delete reqData.updatedAt;
      reqData.collectionId = newCollection._id;
      return reqData;
    });

    await Request.insertMany(duplicateRequests);
    newCollection.requestCount = duplicateRequests.length;
    await newCollection.save();
  }

  successResponse(res, { collection: newCollection }, 'Collection duplicated successfully', 201);
});
