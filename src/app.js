// File: backend/src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const { protect } = require('./middlewares/authMiddleware');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const dealRoutes = require('./routes/dealRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const disciplineRoutes = require('./routes/disciplineRoutes');

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: false
  })
);
app.use(express.json({ limit: '1mb' }));

if (env.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', service: 'atenza-tracker-api' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/leads', protect, leadRoutes);
app.use('/api/v1/interactions', protect, interactionRoutes);
app.use('/api/v1/deals', protect, dealRoutes);
app.use('/api/v1/dashboard', protect, dashboardRoutes);
app.use('/api/v1/discipline', protect, disciplineRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
