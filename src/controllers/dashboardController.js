// File: backend/src/controllers/dashboardController.js
const asyncHandler = require('express-async-handler');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Interaction = require('../models/Interaction');
const { startOfDay, endOfDay, subDays } = require('../utils/date');
const { getBehaviorSummary } = require('../services/disciplineService');

const DAILY_TARGET = 8;
const GOAL_TOTAL_TARGET = 1680;
const GOAL_END_DATE = new Date('2026-12-15T23:59:59.999Z');

const diffInDaysInclusive = (startDate, endDate) => {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const start = startOfDay(startDate).getTime();
  const end = startOfDay(endDate).getTime();
  return Math.floor((end - start) / oneDayMs) + 1;
};

const getSummary = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(now);
  const nearingColdThreshold = subDays(now, 5);
  const coldThreshold = subDays(now, 8);
  const goalStartDate = startOfDay(req.user.createdAt || now);

  const [
    newSeriousToday,
    activeLeads,
    dueToday,
    overdue,
    nearingCold,
    coldLeads,
    bucketDist,
    dealsAgg,
    recentActivity,
    recentDeals,
    lastNewSerious,
    newSeriousSinceGoalStart,
    behavior
  ] = await Promise.all([
    Interaction.countDocuments({
      owner,
      type: 'new_serious',
      interactionDate: { $gte: start, $lte: end }
    }),
    Lead.countDocuments({ owner, archived: false, status: { $in: ['active', 'paused'] } }),
    Lead.countDocuments({ owner, archived: false, status: 'active', nextFollowUp: { $gte: start, $lte: end } }),
    Lead.countDocuments({ owner, archived: false, status: 'active', nextFollowUp: { $lt: start } }),
    Lead.countDocuments({
      owner,
      archived: false,
      status: 'active',
      lastContacted: { $lte: nearingColdThreshold, $gt: coldThreshold }
    }),
    Lead.countDocuments({ owner, archived: false, status: 'active', lastContacted: { $lte: coldThreshold } }),
    Lead.aggregate([
      { $match: { owner, archived: false } },
      { $group: { _id: '$bucket', count: { $sum: 1 } } }
    ]),
    Deal.aggregate([
      { $match: { owner } },
      { $group: { _id: null, deals: { $sum: 1 }, revenue: { $sum: '$amount' } } }
    ]),
    Interaction.find({ owner }).populate('lead', 'name messengerName').sort({ interactionDate: -1 }).limit(8),
    Deal.find({ owner }).populate('lead', 'name messengerName').sort({ closedAt: -1 }).limit(5),
    Interaction.findOne({ owner, type: 'new_serious' }).sort({ interactionDate: -1 }).select('interactionDate'),
    Interaction.countDocuments({
      owner,
      type: 'new_serious',
      interactionDate: { $gte: goalStartDate, $lte: end }
    }),
    getBehaviorSummary(owner)
  ]);

  const checkpointDate = startOfDay(lastNewSerious?.interactionDate || now);
  const cappedCheckpointDate = checkpointDate > GOAL_END_DATE ? startOfDay(GOAL_END_DATE) : checkpointDate;
  const elapsedDays = Math.max(diffInDaysInclusive(goalStartDate, cappedCheckpointDate), 1);
  const expectedByCheckpoint = Math.min(elapsedDays * DAILY_TARGET, GOAL_TOTAL_TARGET);
  const goalDeficit = Math.max(expectedByCheckpoint - newSeriousSinceGoalStart, 0);
  const hasNewLeadToday = newSeriousToday > 0;

  res.json({
    dailyTarget: {
      target: DAILY_TARGET,
      completed: newSeriousToday,
      remaining: Math.max(DAILY_TARGET - newSeriousToday, 0),
      belowTarget: newSeriousToday < DAILY_TARGET,
      hasNewLeadToday
    },
    discipline: {
      goalStartDate,
      goalEndDate: GOAL_END_DATE,
      goalTotalTarget: GOAL_TOTAL_TARGET,
      expectedByCheckpoint,
      actualByCheckpoint: newSeriousSinceGoalStart,
      deficit: goalDeficit,
      isBehind: goalDeficit > 0,
      checkpointDate: lastNewSerious?.interactionDate || now,
      lastNewSeriousAt: lastNewSerious?.interactionDate || null,
      behavior
    },
    leads: {
      active: activeLeads,
      dueToday,
      overdue,
      nearingCold,
      cold: coldLeads,
      buckets: bucketDist.reduce((acc, item) => ({ ...acc, [item._id || 'unassigned']: item.count }), {})
    },
    deals: {
      count: dealsAgg[0]?.deals || 0,
      revenue: dealsAgg[0]?.revenue || 0
    },
    recentActivity,
    recentDeals
  });
});

module.exports = {
  getSummary
};
