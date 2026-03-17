// File: backend/src/utils/date.js
const startOfDay = (dateInput) => {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (dateInput) => {
  const date = new Date(dateInput);
  date.setHours(23, 59, 59, 999);
  return date;
};

const subDays = (dateInput, days) => {
  const date = new Date(dateInput);
  date.setDate(date.getDate() - days);
  return date;
};

const differenceInCalendarDays = (laterDate, earlierDate) => {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const a = startOfDay(laterDate).getTime();
  const b = startOfDay(earlierDate).getTime();
  return Math.round((a - b) / oneDayMs);
};

const getTodayRange = () => {
  const now = new Date();
  return {
    start: startOfDay(now),
    end: endOfDay(now)
  };
};

const getLeadTemperature = (lastContacted) => {
  if (!lastContacted) return 'cold';
  const days = differenceInCalendarDays(new Date(), new Date(lastContacted));
  if (days <= 1) return 'hot';
  if (days <= 4) return 'warm';
  if (days <= 7) return 'nearing_cold';
  return 'cold';
};

const getUrgencyLabel = (nextFollowUp) => {
  if (!nextFollowUp) return 'none';
  const today = startOfDay(new Date());
  const date = startOfDay(new Date(nextFollowUp));
  const diff = differenceInCalendarDays(date, today);

  if (diff < 0) return 'overdue';
  if (diff === 0) return 'due_today';
  if (diff <= 2) return 'upcoming';
  return 'scheduled';
};

const getNearingColdThreshold = () => subDays(new Date(), 5);
const getColdThreshold = () => subDays(new Date(), 8);

module.exports = {
  getTodayRange,
  getLeadTemperature,
  getUrgencyLabel,
  getNearingColdThreshold,
  getColdThreshold,
  startOfDay,
  endOfDay,
  subDays
};
