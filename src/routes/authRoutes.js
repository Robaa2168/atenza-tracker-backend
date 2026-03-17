// File: backend/src/routes/authRoutes.js
const express = require('express');
const { register, login, me } = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, me);

module.exports = router;
