// File: backend/src/validators/dealValidator.js
const { z } = require('zod');

const createDealSchema = z.object({
  leadId: z.string().min(24).max(24),
  title: z.string().trim().min(2).max(160),
  amount: z.number().nonnegative(),
  currency: z.string().trim().min(3).max(8).optional().default('USD'),
  closedAt: z.string().datetime(),
  notes: z.string().max(2000).optional().default('')
});

const listDealsQuerySchema = z.object({
  leadId: z.string().min(24).max(24).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional()
});

module.exports = {
  createDealSchema,
  listDealsQuerySchema
};
