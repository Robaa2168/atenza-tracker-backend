// File: backend/src/controllers/disciplineController.js
const asyncHandler = require('express-async-handler');
const { isValidObjectId } = require('mongoose');
const WorkInterval = require('../models/WorkInterval');
const { getBehaviorSummary } = require('../services/disciplineService');
const { toDayKey, fromDayKeyStart } = require('../utils/dayKey');

const MAX_DATE = new Date('9999-12-31T23:59:59.999Z');

const parseDayTime = (dayKey, time) => {
  const [hh, mm] = time.split(':').map(Number);
  const dayStart = fromDayKeyStart(dayKey);
  const date = new Date(dayStart);
  date.setUTCMinutes(date.getUTCMinutes() + hh * 60 + mm);
  return date;
};

const getIntervalAt = async (owner, at, excludeId) => {
  const query = {
    owner,
    startAt: { $lte: at },
    $or: [{ endAt: null }, { endAt: { $gt: at } }]
  };
  if (excludeId) query._id = { $ne: excludeId };
  return WorkInterval.findOne(query).sort({ startAt: -1 });
};

const ensureNoOverlap = async (owner, startAt, endAt, excludeId) => {
  const effectiveEnd = endAt || MAX_DATE;
  const query = {
    owner,
    startAt: { $lt: effectiveEnd },
    $or: [{ endAt: null }, { endAt: { $gt: startAt } }]
  };

  if (excludeId) query._id = { $ne: excludeId };

  const conflict = await WorkInterval.findOne(query).select('_id wakeState status startAt endAt');
  if (conflict) {
    const start = conflict.startAt.toISOString();
    const end = conflict.endAt ? conflict.endAt.toISOString() : 'ongoing';
    const msg = `Overlap with existing ${conflict.wakeState}+${conflict.status} interval (${start} - ${end}).`;
    const err = new Error(msg);
    err.statusCode = 409;
    throw err;
  }
};

const transitionStateAt = async (owner, at, wakeState, status) => {
  if (wakeState === 'sleep' && status !== 'out_of_work') {
    const err = new Error('sleep state can only be paired with out_of_work status');
    err.statusCode = 400;
    throw err;
  }

  const activeAtTime = await getIntervalAt(owner, at);
  if (activeAtTime) {
    if (activeAtTime.wakeState === wakeState && activeAtTime.status === status) {
      const err = new Error(`State is already ${wakeState}+${status} at that time.`);
      err.statusCode = 409;
      throw err;
    }

    if (at <= activeAtTime.startAt) {
      const err = new Error('Switch time must be later than current interval start.');
      err.statusCode = 400;
      throw err;
    }

    activeAtTime.endAt = at;
    await activeAtTime.save();
  }

  const nextInterval = await WorkInterval.findOne({
    owner,
    startAt: { $gt: at }
  })
    .sort({ startAt: 1 })
    .select('startAt');

  const endAt = nextInterval?.startAt || null;
  await ensureNoOverlap(owner, at, endAt, null);

  return WorkInterval.create({
    owner,
    wakeState,
    status,
    startAt: at,
    endAt
  });
};

const getSummary = asyncHandler(async (req, res) => {
  const behavior = await getBehaviorSummary(req.user._id, req.query.dayKey);
  res.json({ behavior });
});

const setWakeUp = asyncHandler(async (req, res) => {
  const at = req.body.at ? new Date(req.body.at) : new Date();
  const interval = await transitionStateAt(req.user._id, at, 'awake', 'out_of_work');
  const behavior = await getBehaviorSummary(req.user._id);
  res.status(201).json({ interval, behavior });
});

const setSleep = asyncHandler(async (req, res) => {
  const at = req.body.at ? new Date(req.body.at) : new Date();
  const interval = await transitionStateAt(req.user._id, at, 'sleep', 'out_of_work');
  const behavior = await getBehaviorSummary(req.user._id);
  res.status(201).json({ interval, behavior });
});

const createWorkInterval = asyncHandler(async (req, res) => {
  const { wakeState = 'awake', status, startAt: startAtInput, endAt: endAtInput, ongoing } = req.body;
  const startAt = new Date(startAtInput);
  const endAt = ongoing ? null : new Date(endAtInput);

  if (wakeState === 'sleep' && status !== 'out_of_work') {
    res.status(400);
    throw new Error('sleep state can only be paired with out_of_work status');
  }

  if (!ongoing && endAt <= startAt) {
    res.status(400);
    throw new Error('endAt must be later than startAt');
  }

  await ensureNoOverlap(req.user._id, startAt, endAt, null);

  const interval = await WorkInterval.create({
    owner: req.user._id,
    wakeState,
    status,
    startAt,
    endAt
  });

  const behavior = await getBehaviorSummary(req.user._id);
  res.status(201).json({ interval, behavior });
});

const updateWorkInterval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid interval ID');
  }

  const interval = await WorkInterval.findOne({ _id: id, owner: req.user._id });
  if (!interval) {
    res.status(404);
    throw new Error('Work interval not found');
  }

  const { dayKey, startTime, endTime, ongoing } = req.body;
  const originalDayKey = toDayKey(interval.startAt);
  if (dayKey !== originalDayKey) {
    res.status(400);
    throw new Error('Date cannot be changed. Only time can be edited.');
  }

  const newStartAt = parseDayTime(dayKey, startTime);
  const newEndAt = ongoing ? null : parseDayTime(dayKey, endTime);

  if (!ongoing && newEndAt <= newStartAt) {
    res.status(400);
    throw new Error('End time must be later than start time.');
  }

  if (interval.wakeState === 'sleep' && interval.status !== 'out_of_work') {
    res.status(400);
    throw new Error('Invalid interval state detected for sleep entry.');
  }

  await ensureNoOverlap(req.user._id, newStartAt, newEndAt, interval._id);

  interval.startAt = newStartAt;
  interval.endAt = newEndAt;
  await interval.save();

  const behavior = await getBehaviorSummary(req.user._id);
  res.json({ interval, behavior });
});

const logWorkStatus = asyncHandler(async (req, res) => {
  const at = req.body.at ? new Date(req.body.at) : new Date();
  const activeAt = await getIntervalAt(req.user._id, at);

  if (!activeAt) {
    res.status(400);
    throw new Error('Set wake-up first, then set working/out_of_work state.');
  }

  if (activeAt.wakeState === 'sleep') {
    res.status(400);
    throw new Error('Cannot set work status while sleeping at that time.');
  }

  const interval = await transitionStateAt(req.user._id, at, 'awake', req.body.status);
  const behavior = await getBehaviorSummary(req.user._id);
  res.status(201).json({ interval, behavior });
});

module.exports = {
  getSummary,
  setWakeUp,
  setSleep,
  createWorkInterval,
  updateWorkInterval,
  logWorkStatus
};
