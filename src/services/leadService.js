// File: backend/src/services/leadService.js
const { getLeadTemperature, getUrgencyLabel } = require('../utils/date');

const serializeLead = (leadDoc, extra = {}) => {
  const lead = leadDoc.toObject ? leadDoc.toObject() : leadDoc;
  return {
    ...lead,
    computedTemperature: getLeadTemperature(lead.lastContacted),
    computedUrgency: getUrgencyLabel(lead.nextFollowUp),
    ...extra
  };
};

module.exports = {
  serializeLead
};
