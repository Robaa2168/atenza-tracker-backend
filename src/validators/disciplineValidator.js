// File: backend/src/validators/disciplineValidator.js
const { z } = require('zod');

const wakeUpSchema = z.object({
  at: z.string().datetime().optional(),
  dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

const sleepSchema = z.object({
  at: z.string().datetime().optional(),
  dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

const workStatusSchema = z.object({
  status: z.enum(['working', 'out_of_work']),
  at: z.string().datetime().optional()
});

const createWorkIntervalSchema = z
  .object({
    wakeState: z.enum(['awake', 'sleep']).optional().default('awake'),
    status: z.enum(['working', 'out_of_work']),
    startAt: z.string().datetime(),
    endAt: z.string().datetime().nullable().optional(),
    ongoing: z.boolean().optional().default(false)
  })
  .refine((v) => !(v.wakeState === 'sleep' && v.status !== 'out_of_work'), {
    message: 'sleep intervals can only use out_of_work status',
    path: ['status']
  })
  .refine((v) => v.ongoing || Boolean(v.endAt), {
    message: 'Provide endAt or set ongoing=true',
    path: ['endAt']
  });

const updateWorkIntervalSchema = z
  .object({
    dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
    ongoing: z.boolean().optional().default(false)
  })
  .refine((v) => v.ongoing || Boolean(v.endTime), {
    message: 'Provide endTime or set ongoing=true',
    path: ['endTime']
  });

module.exports = {
  wakeUpSchema,
  sleepSchema,
  workStatusSchema,
  createWorkIntervalSchema,
  updateWorkIntervalSchema
};
