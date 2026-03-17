// File: backend/src/validators/authValidator.js
const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  password: z.string().min(8).max(100)
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(100)
});

module.exports = {
  registerSchema,
  loginSchema
};
