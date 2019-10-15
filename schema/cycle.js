const mongoose = require('mongoose');

const { Schema } = mongoose;

module.exports = new Schema({
  cycle_id: {
    // Hardware contained Cycle ID
    type: String,
    required: false
  },
  name: { type: String, required: false }
});
