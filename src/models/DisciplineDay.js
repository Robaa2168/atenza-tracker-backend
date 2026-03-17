// File: backend/src/models/DisciplineDay.js
const mongoose = require('mongoose');

const disciplineDaySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    dayKey: {
      type: String,
      required: true,
      index: true
    },
    wakeUpAt: {
      type: Date,
      default: null
    },
    sleepAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

disciplineDaySchema.index({ owner: 1, dayKey: 1 }, { unique: true });

module.exports = mongoose.model('DisciplineDay', disciplineDaySchema);
