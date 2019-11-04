const express = require('express');
const jwt = require('jsonwebtoken');

const { User } = require('../schema');
const { sendOTP, verifyOTP } = require('../helpers/sms');
const { JWT_SECRET } = require('../helpers/config');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, phone } = req.body;

  try {
    // Check if user already exists
    if (await User.findOne({ phone })) {
      throw new Error('User already exists');
    }

    const otpResponse = await sendOTP(phone);

    const newUser = new User({
      name,
      phone
    });

    await newUser.save();

    res.status(200).json(otpResponse);
  } catch (error) {
    res.status(500).send({
      error: 'Signup Failed',
      msg: error.message
    });
  }
});

router.post('/login', async (req, res) => {
  const { phone } = req.body;

  try {
    if (await User.findOne({ phone })) {
      const otpResponse = await sendOTP(phone);
      res.status(200).json(otpResponse);
    } else {
      throw new Error('User does not exist');
    }
  } catch (error) {
    res.status(500).send({
      error: 'Login Failed',
      msg: error.message
    });
  }
});

router.post('/verify', async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const user = await User.findOne({ phone }, '_id name phone');
    if (user) {
      const otpResponse = await verifyOTP(phone, otp);

      if (otpResponse.type === 'success') {
        const token = jwt.sign(user.toJSON(), JWT_SECRET, {
          expiresIn: '30d'
        });
        res.status(200).json({
          type: 'success',
          token
        });
      }
    } else {
      throw new Error('User does not exist');
    }
  } catch (error) {
    res.status(500).send({
      error: 'Verification Failed',
      msg: error.message
    });
  }
});

module.exports = router;
