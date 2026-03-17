// File: backend/src/config/env.js
const dotenv = require('dotenv');

dotenv.config();

const normalizeMongoUri = (rawUri = '') => {
  let uri = String(rawUri).trim().replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
  if (uri.startsWith('MONGODB_URI=')) {
    uri = uri.slice('MONGODB_URI='.length);
  }
  return uri;
};

const required = ['MONGODB_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const normalizedMongoUri = normalizeMongoUri(process.env.MONGODB_URI);
if (!/^mongodb(\+srv)?:\/\//.test(normalizedMongoUri)) {
  throw new Error('Invalid MONGODB_URI: expected value to start with "mongodb://" or "mongodb+srv://"');
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: normalizedMongoUri,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};
