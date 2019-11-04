const mongosoe = require('mongoose');

const { Schema } = mongosoe;

module.exports = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    unique: [true, 'User already exists'],
    validate: {
      validator: v => {
        return /[6-9]\d{9}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'User phone number required']
  },
  credits: {
    type: Number,
    required: true,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false,
    required: true
  }
});
