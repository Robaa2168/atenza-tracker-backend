// File: backend/src/server.js
const app = require('./app');
const connectDb = require('./config/db');
const env = require('./config/env');

const start = async () => {
  try {
    await connectDb();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Atenza Tracker API running on port ${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();
