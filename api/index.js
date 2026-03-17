// File: backend/api/index.js
const app = require('../src/app');
const connectDb = require('../src/config/db');

let dbReadyPromise = null;

const ensureDb = async () => {
  if (!dbReadyPromise) {
    dbReadyPromise = connectDb().catch((error) => {
      dbReadyPromise = null;
      throw error;
    });
  }
  return dbReadyPromise;
};

module.exports = async (req, res) => {
  await ensureDb();
  return app(req, res);
};
