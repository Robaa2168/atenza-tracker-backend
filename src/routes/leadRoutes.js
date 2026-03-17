// File: backend/src/routes/leadRoutes.js
const express = require('express');
const {
  listLeads,
  getLeadById,
  createLead,
  updateLead,
  archiveLead
} = require('../controllers/leadController');
const validate = require('../middlewares/validate');
const { createLeadSchema, updateLeadSchema, listLeadsQuerySchema } = require('../validators/leadValidator');

const router = express.Router();

router.get('/', validate(listLeadsQuerySchema, 'query'), listLeads);
router.get('/:id', getLeadById);
router.post('/', validate(createLeadSchema), createLead);
router.patch('/:id', validate(updateLeadSchema), updateLead);
router.patch('/:id/archive', archiveLead);

module.exports = router;
