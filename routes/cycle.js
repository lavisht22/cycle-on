const express = require('express');
const { CYCLE_STATUS } = require('../helpers/constants');
const { Cycle } = require('../schema');

const router = express.Router();

router.get('/', async (req, res) => {
  console.log(req.user);
  try {
    const availableCycles = await Cycle.find({ cycle_status: CYCLE_STATUS.AVAILABLE });
    res.status(200).json(availableCycles);
  } catch (error) {
    res.status(500).json({
      type: 'error',
      error: 'Unable to fetch available cycles',
      message: error.message
    });
  }
});

// router.put('/:cycleId/unlock', async (req, res) => {
//   const { cycleId } = req.params;

//   try {
//     await redisHelper.setKey(`${cycleId}_status`, CYCLE_STATUS.BOOKED);
//     await redisHelper.setKey(`${cycleId}_lock`, LOCK_STATUS.UNLOCKED);
//     res.status(200).send('OK');
//   } catch (error) {
//     res.status(500).send(error.toString);
//   }
// });

// router.put('/:cycleId/lock', async (req, res) => {
//   const { cycleId } = req.params;

//   try {
//     await redisHelper.setKey(`${cycleId}_status`, CYCLE_STATUS.AVAILABLE);
//     await redisHelper.setKey(`${cycleId}_lock`, LOCK_STATUS.LOCKED);
//     res.status(200).send('OK');
//   } catch (error) {
//     res.status(500).send(error.toString);
//   }
// });

module.exports = router;
