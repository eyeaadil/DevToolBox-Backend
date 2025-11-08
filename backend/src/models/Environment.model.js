import mongoose from 'mongoose';

const environmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Environment name is required'],
      trim: true,
      maxlength: [100, 'Environment name cannot exceed 100 characters'],
    },
    variables: {
      type: Map,
      of: String,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
environmentSchema.index({ userId: 1, name: 1 });

// Ensure only one active environment per user
environmentSchema.pre('save', async function (next) {
  if (this.isActive && this.isModified('isActive')) {
    await mongoose.model('Environment').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

const Environment = mongoose.model('Environment', environmentSchema);

export default Environment;
