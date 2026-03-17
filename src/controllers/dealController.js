// File: backend/src/controllers/dealController.js
const asyncHandler = require('express-async-handler');
const { isValidObjectId } = require('mongoose');
const Deal = require('../models/Deal');
const Lead = require('../models/Lead');

const createDeal = asyncHandler(async (req, res) => {
  const { leadId, title, amount, currency, closedAt, notes } = req.body;

  if (!isValidObjectId(leadId)) {
    res.status(400);
    throw new Error('Invalid lead ID');
  }

  const lead = await Lead.findOne({ _id: leadId, owner: req.user._id });
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }

  const deal = await Deal.create({
    owner: req.user._id,
    lead: lead._id,
    title,
    amount,
    currency,
    closedAt: new Date(closedAt),
    notes
  });

  if (lead.status !== 'closed') {
    lead.status = 'closed';
    await lead.save();
  }

  res.status(201).json({ deal });
});

const listDeals = asyncHandler(async (req, res) => {
  const { leadId, page = '1', limit = '20' } = req.query;
  const filter = { owner: req.user._id };

  if (leadId) {
    if (!isValidObjectId(leadId)) {
      res.status(400);
      throw new Error('Invalid lead ID');
    }
    filter.lead = leadId;
  }

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const [items, total, revenueAgg] = await Promise.all([
    Deal.find(filter).populate('lead', 'name messengerName').sort({ closedAt: -1 }).skip(skip).limit(pageSize),
    Deal.countDocuments(filter),
    Deal.aggregate([
      { $match: filter },
      { $group: { _id: null, revenue: { $sum: '$amount' } } }
    ])
  ]);

  res.json({
    items,
    totals: {
      deals: total,
      revenue: revenueAgg[0]?.revenue || 0
    },
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize)
    }
  });
});

module.exports = {
  createDeal,
  listDeals
};
