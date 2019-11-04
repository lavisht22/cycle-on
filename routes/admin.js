const express = require('express');

const { Cycle } = require('../schema');
const redisHelper = require('../helpers/redis');
const { LOCK_STATUS, CYCLE_STATUS } = require('../helpers/constants');

const router = express.Router();

router.post('/addCycle', async (req, res) => {
  const { cycleId, name, long, lat } = req.body;
  try {
    if (await Cycle.findOne({ cycle_id: cycleId })) {
      throw new Error('Cycle with this ID already exists');
    } else {
      const newCycle = await new Cycle({ cycle_id: cycleId, name }).save();
      await redisHelper.setKey(`${cycleId}_status`, CYCLE_STATUS.AVAILABLE);
      await redisHelper.setKey(`${cycleId}_lock`, LOCK_STATUS.LOCKED);
      await redisHelper.setKey(`${cycleId}_long`, long);
      await redisHelper.setKey(`${cycleId}_lat`, lat);
      res.status(200).json(newCycle);
    }
  } catch (error) {
    res.status(500).json({
      type: 'error',
      error: 'Unable to add new cycle',
      message: error.message
    });
  }
});

module.exports = router;
