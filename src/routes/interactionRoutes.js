// File: backend/src/routes/interactionRoutes.js
const express = require('express');
const { createInteraction, listInteractions } = require('../controllers/interactionController');
const validate = require('../middlewares/validate');
const { createInteractionSchema, listInteractionQuerySchema } = require('../validators/interactionValidator');

const router = express.Router();

router.get('/', validate(listInteractionQuerySchema, 'query'), listInteractions);
router.post('/', validate(createInteractionSchema), createInteraction);

module.exports = router;
