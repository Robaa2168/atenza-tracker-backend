// File: backend/src/models/Deal.js
const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
      maxlength: 8
    },
    closedAt: {
      type: Date,
      required: true,
      index: true
    },
    notes: {
      type: String,
      default: '',
      maxlength: 2000
    }
  },
  {
    timestamps: true
  }
);

dealSchema.index({ owner: 1, closedAt: -1 });

module.exports = mongoose.model('Deal', dealSchema);
