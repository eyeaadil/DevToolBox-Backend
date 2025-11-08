import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      maxlength: [100, 'Collection name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    color: {
      type: String,
      default: '#3B82F6', // Blue color
      match: [/^#[0-9A-F]{6}$/i, 'Invalid color format'],
    },
    icon: {
      type: String,
      default: 'folder',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    requestCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
collectionSchema.index({ userId: 1, createdAt: -1 });
collectionSchema.index({ userId: 1, name: 1 });

// Virtual for requests
collectionSchema.virtual('requests', {
  ref: 'Request',
  localField: '_id',
  foreignField: 'collectionId',
});

// Method to increment request count
collectionSchema.methods.incrementRequestCount = async function () {
  this.requestCount += 1;
  await this.save();
};

// Method to decrement request count
collectionSchema.methods.decrementRequestCount = async function () {
  if (this.requestCount > 0) {
    this.requestCount -= 1;
    await this.save();
  }
};

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
