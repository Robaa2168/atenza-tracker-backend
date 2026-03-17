// File: backend/src/models/Interaction.js
const mongoose = require('mongoose');
const { INTERACTION_TYPES } = require('../utils/constants');

const interactionSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: INTERACTION_TYPES,
      required: true,
      index: true
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    note: {
      type: String,
      default: '',
      maxlength: 3000
    },
    interactionDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    nextFollowUp: {
      type: Date,
      default: null
    },
    markAsContacted: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

interactionSchema.index({ owner: 1, interactionDate: -1 });
interactionSchema.index({ lead: 1, interactionDate: -1 });

module.exports = mongoose.model('Interaction', interactionSchema);
