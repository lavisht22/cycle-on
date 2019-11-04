const mongoose = require('mongoose');

const { CYCLE_STATUS, LOCK_STATUS } = require('../helpers/constants');

const { Schema } = mongoose;

module.exports = new Schema({
  cycle_id: {
    // Hardware contained Cycle ID
    type: String,
    required: true
  },
  name: { type: String, required: true },
  cycle_status: {
    type: String,
    enum: [CYCLE_STATUS.AVAILABLE, CYCLE_STATUS.BOOKED],
    required: true,
    default: CYCLE_STATUS.AVAILABLE
  },
  lock_status: {
    type: String,
    enum: [LOCK_STATUS.LOCKED, LOCK_STATUS.UNLOCKED],
    required: true,
    default: LOCK_STATUS.LOCKED
  }
});
