// File: backend/src/routes/dealRoutes.js
const express = require('express');
const { createDeal, listDeals } = require('../controllers/dealController');
const validate = require('../middlewares/validate');
const { createDealSchema, listDealsQuerySchema } = require('../validators/dealValidator');

const router = express.Router();

router.get('/', validate(listDealsQuerySchema, 'query'), listDeals);
router.post('/', validate(createDealSchema), createDeal);

module.exports = router;
