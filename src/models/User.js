// File: backend/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 180
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
