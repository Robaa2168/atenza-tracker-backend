// File: backend/src/models/WorkStatusEvent.js
const mongoose = require('mongoose');

const workStatusEventSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['working', 'out_of_work'],
      required: true,
      index: true
    },
    at: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

workStatusEventSchema.index({ owner: 1, at: -1 });

module.exports = mongoose.model('WorkStatusEvent', workStatusEventSchema);
