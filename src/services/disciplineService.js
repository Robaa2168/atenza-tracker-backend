// File: backend/src/services/disciplineService.js
const WorkInterval = require('../models/WorkInterval');
const { toDayKey, previousDayKey, fromDayKeyStart, fromDayKeyEnd } = require('../utils/dayKey');

const roundHours = (ms) => Math.round((ms / (1000 * 60 * 60)) * 100) / 100;

const clipIntervalMs = (intervalStart, intervalEnd, rangeStart, rangeEnd) => {
  const start = intervalStart > rangeStart ? intervalStart : rangeStart;
  const end = intervalEnd < rangeEnd ? intervalEnd : rangeEnd;
  return end > start ? end.getTime() - start.getTime() : 0;
};

const getDayContext = async (owner, dayKey) => {
  const start = fromDayKeyStart(dayKey);
  const end = fromDayKeyEnd(dayKey);
  const now = new Date();
  const dayEndOrNow = end > now ? now : end;

  const intervals = await WorkInterval.find({
    owner,
    startAt: { $lt: dayEndOrNow },
    $or: [{ endAt: null }, { endAt: { $gt: start } }]
  }).sort({ startAt: 1 });

  return { start, end, now, dayEndOrNow, intervals };
};

const computeTotals = (intervals, rangeStart, rangeEnd) => {
  let workingMs = 0;
  let outOfWorkMs = 0;
  let sleepingMs = 0;

  intervals.forEach((interval) => {
    const intervalEnd = interval.endAt ? new Date(interval.endAt) : rangeEnd;
    const ms = clipIntervalMs(new Date(interval.startAt), intervalEnd, rangeStart, rangeEnd);
    if (!ms) return;

    if (interval.wakeState === 'sleep') {
      sleepingMs += ms;
      return;
    }

    if (interval.status === 'working') workingMs += ms;
    if (interval.status === 'out_of_work') outOfWorkMs += ms;
  });

  return {
    workingHours: roundHours(workingMs),
    outOfWorkHours: roundHours(outOfWorkMs),
    sleepingHours: roundHours(sleepingMs)
  };
};

const mapIntervalsForDay = (intervals, dayStart, dayEndOrNow) =>
  intervals
    .map((interval) => {
      const start = new Date(interval.startAt);
      const rawEnd = interval.endAt ? new Date(interval.endAt) : dayEndOrNow;
      const clippedStart = start < dayStart ? dayStart : start;
      const clippedEnd = rawEnd > dayEndOrNow ? dayEndOrNow : rawEnd;

      if (clippedEnd <= clippedStart) return null;

      return {
        _id: interval._id,
        wakeState: interval.wakeState,
        status: interval.status,
        startAt: clippedStart,
        endAt: interval.endAt ? clippedEnd : null
      };
    })
    .filter(Boolean);

const getCurrentInterval = async (owner) =>
  WorkInterval.findOne({
    owner,
    startAt: { $lte: new Date() },
    $or: [{ endAt: null }, { endAt: { $gt: new Date() } }]
  })
    .sort({ startAt: -1 })
    .select('wakeState status startAt');

const getBehaviorSummary = async (owner, requestedDayKey) => {
  const todayKey = toDayKey(new Date());
  const targetDayKey = requestedDayKey || todayKey;
  const yesterdayKey = previousDayKey(todayKey);

  const [todayContext, targetContext, currentInterval, lastAwake, lastSleep] = await Promise.all([
    getDayContext(owner, todayKey),
    getDayContext(owner, targetDayKey),
    getCurrentInterval(owner),
    WorkInterval.findOne({ owner, wakeState: 'awake' }).sort({ startAt: -1 }).select('startAt'),
    WorkInterval.findOne({ owner, wakeState: 'sleep' }).sort({ startAt: -1 }).select('startAt')
  ]);

  const todayTotals = computeTotals(todayContext.intervals, todayContext.start, todayContext.dayEndOrNow);
  const targetTotals = computeTotals(targetContext.intervals, targetContext.start, targetContext.dayEndOrNow);
  const mappedTargetIntervals = mapIntervalsForDay(targetContext.intervals, targetContext.start, targetContext.dayEndOrNow);

  return {
    todayKey,
    targetDayKey,
    yesterdayKey,
    wakeUpAtToday: null,
    sleepAtToday: null,
    sleepAtYesterday: null,
    wakeUpAtTargetDay: null,
    sleepAtTargetDay: null,
    requiresWakeUpInput: false,
    requiresYesterdaySleepUpdate: false,
    pendingSleepDayKeys: [],
    missingSleepCount: 0,
    workingHoursToday: todayTotals.workingHours,
    outOfWorkHoursToday: todayTotals.outOfWorkHours,
    sleepingHoursToday: todayTotals.sleepingHours,
    currentWakeState: currentInterval?.wakeState || null,
    currentWorkStatus: currentInterval?.status || null,
    currentStateSince: currentInterval?.startAt || null,
    currentWorkStatusSince: currentInterval?.startAt || null,
    workingHoursTargetDay: targetTotals.workingHours,
    outOfWorkHoursTargetDay: targetTotals.outOfWorkHours,
    sleepingHoursTargetDay: targetTotals.sleepingHours,
    targetDayStatusEvents: [],
    targetDayCombinedSegments: mappedTargetIntervals.map((interval) => ({
      from: interval.startAt,
      to: interval.endAt || targetContext.dayEndOrNow,
      wakeState: interval.wakeState,
      status: interval.status
    })),
    targetDayWorkIntervals: mappedTargetIntervals,
    isSleepingNow: currentInterval?.wakeState === 'sleep',
    lastWakeAt: lastAwake?.startAt || null,
    lastSleepAt: lastSleep?.startAt || null,
    currentSleepStatus: currentInterval?.wakeState === 'sleep' ? 'sleeping' : 'awake',
    currentSleepStatusSince: currentInterval?.startAt || null
  };
};

module.exports = {
  getBehaviorSummary
};
