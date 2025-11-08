import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      required: [true, 'Collection ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Request name is required'],
      trim: true,
      maxlength: [200, 'Request name cannot exceed 200 characters'],
    },
    method: {
      type: String,
      required: [true, 'HTTP method is required'],
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      uppercase: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    headers: {
      type: Map,
      of: String,
      default: {},
    },
    queryParams: {
      type: Map,
      of: String,
      default: {},
    },
    body: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    bodyType: {
      type: String,
      enum: ['none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw', 'binary'],
      default: 'none',
    },
    auth: {
      type: {
        type: String,
        enum: ['none', 'bearer', 'basic', 'api-key'],
        default: 'none',
      },
      token: String,
      username: String,
      password: String,
      apiKey: String,
      apiValue: String,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
requestSchema.index({ userId: 1, collectionId: 1, createdAt: -1 });
requestSchema.index({ collectionId: 1, order: 1 });

// Pre-remove hook to update collection request count
requestSchema.pre('remove', async function (next) {
  try {
    const Collection = mongoose.model('Collection');
    const collection = await Collection.findById(this.collectionId);
    if (collection) {
      await collection.decrementRequestCount();
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Request = mongoose.model('Request', requestSchema);

export default Request;
