const mongoose = require('mongoose');

const { Schema } = mongoose;

module.exports = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  cycle: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Cycle'
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date
  },
  ended: {
    type: Boolean,
    required: true,
    default: false
  },
  fare: {
    type: Number
  }
});
