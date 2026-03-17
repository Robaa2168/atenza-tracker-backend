// File: backend/src/validators/interactionValidator.js
const { z } = require('zod');
const { INTERACTION_TYPES } = require('../utils/constants');

const createInteractionSchema = z.object({
  leadId: z.string().min(24).max(24),
  type: z.enum(INTERACTION_TYPES),
  summary: z.string().trim().min(2).max(300),
  note: z.string().max(3000).optional().default(''),
  interactionDate: z.string().datetime().optional(),
  nextFollowUp: z.string().datetime().nullable().optional(),
  markAsContacted: z.boolean().optional().default(true)
});

const listInteractionQuerySchema = z.object({
  leadId: z.string().min(24).max(24).optional(),
  type: z.enum(INTERACTION_TYPES).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional()
});

module.exports = {
  createInteractionSchema,
  listInteractionQuerySchema
};
