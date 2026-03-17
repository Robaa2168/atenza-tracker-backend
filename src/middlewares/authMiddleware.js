// File: backend/src/middlewares/authMiddleware.js
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Unauthorized: missing token');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('Unauthorized: user not found');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Unauthorized: invalid token');
  }
});

module.exports = {
  protect
};
