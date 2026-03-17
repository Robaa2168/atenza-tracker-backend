// File: backend/src/controllers/leadController.js
const asyncHandler = require('express-async-handler');
const { isValidObjectId } = require('mongoose');
const Lead = require('../models/Lead');
const Interaction = require('../models/Interaction');
const Deal = require('../models/Deal');
const { serializeLead } = require('../services/leadService');

const parseMaybeDate = (value) => (value ? new Date(value) : null);

const listLeads = asyncHandler(async (req, res) => {
  const {
    search,
    bucket,
    status,
    archived,
    sortBy = 'updatedAt',
    sortOrder = 'desc',
    page = '1',
    limit = '20'
  } = req.query;

  const filter = { owner: req.user._id };

  if (bucket) filter.bucket = bucket;
  if (status) filter.status = status;
  if (archived !== undefined) filter.archived = archived === 'true';

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { messengerName: regex }];
  }

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    Lead.find(filter).sort(sort).skip(skip).limit(pageSize),
    Lead.countDocuments(filter)
  ]);

  res.json({
    items: items.map((lead) => serializeLead(lead)),
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize)
    }
  });
});

const getLeadById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid lead ID');
  }

  const lead = await Lead.findOne({ _id: id, owner: req.user._id });
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }

  const [interactions, deals] = await Promise.all([
    Interaction.find({ owner: req.user._id, lead: id }).sort({ interactionDate: -1 }).limit(100),
    Deal.find({ owner: req.user._id, lead: id }).sort({ closedAt: -1 })
  ]);

  const revenue = deals.reduce((sum, deal) => sum + deal.amount, 0);

  res.json({
    lead: serializeLead(lead, { totalRevenue: revenue }),
    interactions,
    deals,
    totals: {
      dealCount: deals.length,
      revenue
    }
  });
});

const createLead = asyncHandler(async (req, res) => {
  const {
    name,
    messengerName,
    description,
    notesHtml,
    bucket,
    status,
    nextFollowUp,
    lastContacted,
    firstSeriousContactDate,
    initialInteractionSummary,
    initialInteractionNote
  } = req.body;

  const lead = await Lead.create({
    owner: req.user._id,
    name,
    messengerName,
    description,
    notesHtml,
    bucket,
    status,
    nextFollowUp: parseMaybeDate(nextFollowUp),
    lastContacted: parseMaybeDate(lastContacted) || new Date(),
    firstSeriousContactDate: firstSeriousContactDate ? new Date(firstSeriousContactDate) : new Date()
  });

  await Interaction.create({
    owner: req.user._id,
    lead: lead._id,
    type: 'new_serious',
    summary: initialInteractionSummary || 'New serious conversation started',
    note: initialInteractionNote || '',
    interactionDate: new Date(),
    markAsContacted: true
  });

  res.status(201).json({ lead: serializeLead(lead) });
});

const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid lead ID');
  }

  const lead = await Lead.findOne({ _id: id, owner: req.user._id });
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }

  const fields = [
    'name',
    'messengerName',
    'description',
    'notesHtml',
    'bucket',
    'status',
    'archived'
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) lead[field] = req.body[field];
  });

  if (req.body.nextFollowUp !== undefined) lead.nextFollowUp = parseMaybeDate(req.body.nextFollowUp);
  if (req.body.lastContacted !== undefined) lead.lastContacted = parseMaybeDate(req.body.lastContacted);
  if (req.body.firstSeriousContactDate !== undefined) {
    lead.firstSeriousContactDate = new Date(req.body.firstSeriousContactDate);
  }

  await lead.save();
  res.json({ lead: serializeLead(lead) });
});

const archiveLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid lead ID');
  }

  const lead = await Lead.findOne({ _id: id, owner: req.user._id });
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }

  lead.archived = !lead.archived;
  await lead.save();

  res.json({ lead: serializeLead(lead) });
});

module.exports = {
  listLeads,
  getLeadById,
  createLead,
  updateLead,
  archiveLead
};
