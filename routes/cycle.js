const express = require('express');
const { CYCLE_STATUS } = require('../helpers/constants');
const { setKey, getKey } = require('../helpers/redis');
const { Cycle, Trip, User } = require('../schema');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const availableCycles = await Cycle.find({ cycle_status: CYCLE_STATUS.AVAILABLE });
    const cycles = await Promise.all(
      availableCycles.map(cycle => {
        return new Promise(async resolve => {
          const { cycle_id } = cycle;
          const long = await getKey(`${cycle_id}_long`);
          const lat = await getKey(`${cycle_id}_lat`);
          resolve({
            ...cycle._doc,
            coord: {
              long,
              lat
            }
          });
        });
        // await getKey(`${cycleId}_status`);
        // await getKey(`${cycleId}_lock`);
      })
    );
    res.status(200).json(cycles);
  } catch (error) {
    res.status(500).json({
      type: 'error',
      error: 'Unable to fetch available cycles',
      message: error.message
    });
  }
});

router.post('/book', async (req, res) => {
  const { cycleId, duration } = req.body;
  const { user } = req;

  try {
    const activeTrip = await Trip.findOne({ user: user._id, ended: false });
    if (activeTrip) {
      throw new Error('A trip is already active');
    }

    const curUser = await User.findById(user._id);
    if (curUser.credits < 100) {
      throw new Error('You must have minimum ₹100 before making a booking');
    }

    const cycle = await Cycle.findOne({ cycle_id: cycleId });
    if (!cycle) {
      throw new Error('Cycle does not exist.');
    }

    if (Number.isFinite(duration) && Number.isInteger(duration) && duration >= 1 && duration <= 4) {
      const trip = new Trip({
        user: user._id,
        cycle: cycle._id,
        start: Date.now(),
        fare: 10 * duration
      });

      await trip.save();
      cycle.cycle_status = CYCLE_STATUS.BOOKED;
      await cycle.save();
      await setKey(`${cycle.cycle_id}_status`, CYCLE_STATUS.BOOKED);

      res.status(200).json(trip);
    } else {
      throw new Error('Invalid Duration');
    }
  } catch (error) {
    res.status(500).json({
      type: 'error',
      error: 'Cannot complete booking.',
      message: error.message
    });
  }
});

module.exports = router;
