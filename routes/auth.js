const express = require('express');

const { User } = require('../schema');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, phone } = req.body;

  const newUser = new User({
    name,
    phone
  });

  let savedUser;

  try {
    savedUser = await newUser.save();
  } catch (error) {
    res.status(500).send({
      error: 'User Creation Failed',
      msg: error.message
    });
  }

  res.status(200).json(savedUser);
});

router.post('/login', async (req, res) => {
  const { phone } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      res.status(404).json({
        error: 'User does not exsist',
        msg: ''
      });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      error: 'Unable to Login',
      msg: error.toString()
    });
  }
});

module.exports = router;
