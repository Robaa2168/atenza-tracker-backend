// File: backend/src/models/WorkInterval.js
const mongoose = require('mongoose');

const workIntervalSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    wakeState: {
      type: String,
      enum: ['awake', 'sleep'],
      required: true,
      default: 'awake',
      index: true
    },
    status: {
      type: String,
      enum: ['working', 'out_of_work'],
      required: true,
      index: true
    },
    startAt: {
      type: Date,
      required: true,
      index: true
    },
    endAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

workIntervalSchema.pre('validate', function validateWakeState(next) {
  if (this.wakeState === 'sleep' && this.status !== 'out_of_work') {
    next(new Error('Sleep intervals must use out_of_work status.'));
    return;
  }
  next();
});

workIntervalSchema.index({ owner: 1, startAt: 1, endAt: 1 });

module.exports = mongoose.model('WorkInterval', workIntervalSchema);
