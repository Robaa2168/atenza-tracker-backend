// File: backend/src/routes/disciplineRoutes.js
const express = require('express');
const validate = require('../middlewares/validate');
const {
  getSummary,
  setWakeUp,
  setSleep,
  logWorkStatus,
  createWorkInterval,
  updateWorkInterval
} = require('../controllers/disciplineController');
const {
  wakeUpSchema,
  sleepSchema,
  workStatusSchema,
  createWorkIntervalSchema,
  updateWorkIntervalSchema
} = require('../validators/disciplineValidator');

const router = express.Router();

router.get('/summary', getSummary);
router.post('/wakeup', validate(wakeUpSchema), setWakeUp);
router.post('/sleep', validate(sleepSchema), setSleep);
router.post('/status', validate(workStatusSchema), logWorkStatus);
router.post('/work-intervals', validate(createWorkIntervalSchema), createWorkInterval);
router.patch('/work-intervals/:id', validate(updateWorkIntervalSchema), updateWorkInterval);

module.exports = router;
