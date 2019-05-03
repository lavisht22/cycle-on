const express = require('express');
const redisHelper = require('../helpers/redis');
const { CYCLE_STATUS, LOCK_STATUS } = require('../helpers/constants');

const router = express.Router();

router.get('/', (_req, res) => {
  res.status(200).send('Welcome to Cycle-On');
});

router.post('/register', async (req, res) => {
  const { cycleId, lat, long } = req.body;

  try {
    await redisHelper.setKey(`${cycleId}_status`, CYCLE_STATUS.AVAILABLE);
    await redisHelper.setKey(`${cycleId}_lock`, LOCK_STATUS.LOCKED);
    await redisHelper.setKey(`${cycleId}_lat`, lat);
    await redisHelper.setKey(`${cycleId}_long`, long);
  } catch (error) {
    res.status(500).send(error.toString());
    return;
  }
  res.status(200).send('Registered Successfully');
});

router.get('/:cycleId', async (req, res) => {
  const { cycleId } = req.params;

  try {
    const cycleStatus = await redisHelper.getKey(`${cycleId}_status`);
    const cycleLockStatus = await redisHelper.getKey(`${cycleId}_lock`);
    const cycleLat = await redisHelper.getKey(`${cycleId}_lat`);
    const cycleLong = await redisHelper.getKey(`${cycleId}_long`);

    res.status(200).json({ cycleStatus, cycleLockStatus, cycleLat, cycleLong });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

module.exports = router;
