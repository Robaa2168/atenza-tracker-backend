// File: backend/src/controllers/interactionController.js
const asyncHandler = require('express-async-handler');
const { isValidObjectId } = require('mongoose');
const Interaction = require('../models/Interaction');
const Lead = require('../models/Lead');

const createInteraction = asyncHandler(async (req, res) => {
  const { leadId, type, summary, note, interactionDate, nextFollowUp, markAsContacted } = req.body;

  if (!isValidObjectId(leadId)) {
    res.status(400);
    throw new Error('Invalid lead ID');
  }

  const lead = await Lead.findOne({ _id: leadId, owner: req.user._id });
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }

  const date = interactionDate ? new Date(interactionDate) : new Date();

  const interaction = await Interaction.create({
    owner: req.user._id,
    lead: lead._id,
    type,
    summary,
    note,
    interactionDate: date,
    nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
    markAsContacted
  });

  if (markAsContacted) {
    lead.lastContacted = date;
  }

  if (nextFollowUp !== undefined) {
    lead.nextFollowUp = nextFollowUp ? new Date(nextFollowUp) : null;
  }

  if (type === 'new_serious' && !lead.firstSeriousContactDate) {
    lead.firstSeriousContactDate = date;
  }

  if (lead.status !== 'active' && type !== 'note') {
    lead.status = 'active';
  }

  await lead.save();

  res.status(201).json({ interaction });
});

const listInteractions = asyncHandler(async (req, res) => {
  const { leadId, type, page = '1', limit = '30' } = req.query;

  const filter = { owner: req.user._id };

  if (leadId) {
    if (!isValidObjectId(leadId)) {
      res.status(400);
      throw new Error('Invalid lead ID');
    }
    filter.lead = leadId;
  }

  if (type) {
    filter.type = type;
  }

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const [items, total] = await Promise.all([
    Interaction.find(filter)
      .populate('lead', 'name messengerName')
      .sort({ interactionDate: -1 })
      .skip(skip)
      .limit(pageSize),
    Interaction.countDocuments(filter)
  ]);

  res.json({
    items,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize)
    }
  });
});

module.exports = {
  createInteraction,
  listInteractions
};
