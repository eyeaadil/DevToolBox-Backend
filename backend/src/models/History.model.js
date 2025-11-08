import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      default: null,
    },
    method: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    },
    url: {
      type: String,
      required: true,
    },
    headers: {
      type: Map,
      of: String,
      default: {},
    },
    body: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    response: {
      status: Number,
      statusText: String,
      headers: {
        type: Map,
        of: String,
      },
      data: mongoose.Schema.Types.Mixed,
      time: Number, // Response time in ms
      size: Number, // Response size in bytes
    },
    error: {
      message: String,
      code: String,
    },
    executedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
historySchema.index({ userId: 1, executedAt: -1 });
historySchema.index({ userId: 1, method: 1 });

// TTL index - auto-delete history older than 30 days
historySchema.index({ executedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const History = mongoose.model('History', historySchema);

export default History;
