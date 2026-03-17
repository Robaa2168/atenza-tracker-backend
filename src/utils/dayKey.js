// File: backend/src/utils/dayKey.js
const NAIROBI_OFFSET_MINUTES = 3 * 60;
const OFFSET_MS = NAIROBI_OFFSET_MINUTES * 60 * 1000;

const toDayKey = (dateInput = new Date()) => {
  const date = new Date(dateInput);
  const nairobiTime = new Date(date.getTime() + OFFSET_MS);
  const y = nairobiTime.getUTCFullYear();
  const m = String(nairobiTime.getUTCMonth() + 1).padStart(2, '0');
  const d = String(nairobiTime.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const fromDayKeyStart = (dayKey) => {
  const [y, m, d] = dayKey.split('-').map(Number);
  const utcMillis = Date.UTC(y, m - 1, d, 0, 0, 0, 0) - OFFSET_MS;
  return new Date(utcMillis);
};

const fromDayKeyEnd = (dayKey) => {
  const start = fromDayKeyStart(dayKey);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
};

const previousDayKey = (dayKey) => {
  const day = fromDayKeyStart(dayKey);
  day.setUTCDate(day.getUTCDate() - 1);
  return toDayKey(day);
};

module.exports = {
  toDayKey,
  fromDayKeyStart,
  fromDayKeyEnd,
  previousDayKey,
  NAIROBI_OFFSET_MINUTES
};
