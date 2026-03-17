// File: backend/src/models/Lead.js
const mongoose = require('mongoose');
const { LEAD_BUCKETS, LEAD_STATUSES } = require('../utils/constants');

const leadSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    nameLower: {
      type: String,
      index: true
    },
    messengerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    messengerNameLower: {
      type: String,
      index: true
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000
    },
    notesHtml: {
      type: String,
      default: ''
    },
    bucket: {
      type: String,
      enum: LEAD_BUCKETS,
      default: 'warm',
      index: true
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: 'active',
      index: true
    },
    nextFollowUp: {
      type: Date,
      index: true
    },
    lastContacted: {
      type: Date,
      index: true
    },
    firstSeriousContactDate: {
      type: Date,
      required: true
    },
    archived: {
      type: Boolean,
      default: false,
      index: true
    },
    archivedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

leadSchema.pre('save', function preSave(next) {
  this.nameLower = this.name.toLowerCase();
  this.messengerNameLower = this.messengerName.toLowerCase();
  if (this.archived && !this.archivedAt) {
    this.archivedAt = new Date();
  }
  if (!this.archived) {
    this.archivedAt = null;
  }
  next();
});

leadSchema.index({ owner: 1, messengerNameLower: 1 });
leadSchema.index({ owner: 1, nameLower: 1 });
leadSchema.index({ owner: 1, status: 1, nextFollowUp: 1 });

module.exports = mongoose.model('Lead', leadSchema);
