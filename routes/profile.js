const express = require('express');

const { User } = require('../schema');

const router = express.Router();

router.get('/', async (req, res) => {
  const { user } = req;
  try {
    const fetchedUser = await User.findById(user._id);
    res.status(200).json(fetchedUser);
  } catch (error) {
    res.status(500).json({
      type: 'error',
      error: 'Unable to reterive user profile',
      message: error.message
    });
  }
});

router.post('/recharge', async (req, res) => {
  const { user } = req;
  const { amount } = req.body;

  try {
    const fetchedUser = await User.findById(user._id);
    fetchedUser.credits += amount;
    await fetchedUser.save();
    res.status(200).json(fetchedUser);
  } catch (error) {
    res.status(500).json({
      type: 'error',
      error: 'Unable to reterive trips',
      message: error.message
    });
  }
});

module.exports = router;
