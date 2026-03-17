// File: backend/src/utils/constants.js
const LEAD_BUCKETS = ['hot', 'warm', 'nearing_cold', 'cold', 'paused'];
const LEAD_STATUSES = ['active', 'paused', 'closed', 'lost', 'inactive'];
const INTERACTION_TYPES = ['new_serious', 'follow_up', 'incoming', 'outgoing', 'note'];

module.exports = {
  LEAD_BUCKETS,
  LEAD_STATUSES,
  INTERACTION_TYPES
};
