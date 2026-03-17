// File: backend/src/validators/leadValidator.js
const { z } = require('zod');
const { LEAD_BUCKETS, LEAD_STATUSES } = require('../utils/constants');

const leadBaseSchema = z.object({
  name: z.string().trim().min(2).max(120),
  messengerName: z.string().trim().min(2).max(120),
  description: z.string().max(2000).optional().default(''),
  notesHtml: z.string().optional().default(''),
  bucket: z.enum(LEAD_BUCKETS).optional().default('warm'),
  status: z.enum(LEAD_STATUSES).optional().default('active'),
  nextFollowUp: z.string().datetime().nullable().optional(),
  lastContacted: z.string().datetime().nullable().optional(),
  firstSeriousContactDate: z.string().datetime().optional(),
  archived: z.boolean().optional().default(false)
});

const createLeadSchema = leadBaseSchema.extend({
  initialInteractionSummary: z.string().trim().max(300).optional(),
  initialInteractionNote: z.string().max(3000).optional()
});

const updateLeadSchema = leadBaseSchema.partial();

const listLeadsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  bucket: z.enum(LEAD_BUCKETS).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  archived: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['createdAt', 'nextFollowUp', 'lastContacted', 'name', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional()
});

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  listLeadsQuerySchema
};
