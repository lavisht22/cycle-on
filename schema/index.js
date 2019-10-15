const mongoose = require('mongoose');

const CycleSchema = require('./cycle');
const TripSchema = require('./trip');
const UserSchema = require('./user');

module.exports = {
  Cycle: mongoose.model('Cycle', CycleSchema),
  Trip: mongoose.model('Trip', TripSchema),
  User: mongoose.model('User', UserSchema)
};
