// File: backend/src/scripts/seedUser.js
const bcrypt = require('bcryptjs');
const connectDb = require('../config/db');
require('dotenv').config();
const User = require('../models/User');

const seed = async () => {
  const email = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;
  const name = process.env.SEED_USER_NAME || 'Atenza Owner';

  if (!email || !password) {
    throw new Error('SEED_USER_EMAIL and SEED_USER_PASSWORD are required');
  }

  await connectDb();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log('Seed user already exists:', existing.email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword
  });

  // eslint-disable-next-line no-console
  console.log('Seed user created:', email.toLowerCase());
  process.exit(0);
};

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error.message);
  process.exit(1);
});
