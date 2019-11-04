const express = require('express');

const { Trip, User, Cycle } = require('../schema');

const { CYCLE_STATUS, LOCK_STATUS } = require('../helpers/constants');
const { setKey } = require('../helpers/redis');

const router = express.Router();

router.get('/', async (req, res) => {
  const { user } = req;

  try {
    const trips = await Trip.find({ user: user._id }).populate('cycle', {
      cycle_status: false,
      lock_status: false
    });
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({
      type: 'error',
      error: 'Unable to reterive trips',
      message: error.message
    });
  }
});

router.get('/active', async (req, res) => {
  const { user } = req;

  try {
    const trip = await Trip.findOne({ user: user._id, ended: false }).populate('cycle', {
      cycle_status: false,
      lock_status: false
    });
    if (trip) {
      res.status(200).json(trip);
    } else {
      throw new Error('No Active Trip');
    }
  } catch (error) {
    res.status(500).json({
      type: 'error',
      error: 'Unable to reterive active trip',
      message: error.message
    });
  }
});

router.put('/active/lock', async (req, res) => {
  const { user } = req;

  try {
    const trip = await Trip.findOne({ user: user._id, ended: false });
    if (!trip) {
      throw new Error('No Active Trip');
    }

    if (String(trip.user) !== user._id) {
      throw new Error('You do not have permissions to access this trip');
    }

    const cycle = await Cycle.findById(trip.cycle);
    cycle.lock_status = LOCK_STATUS.LOCKED;
    await cycle.save();
    await setKey(`${cycle.cycle_id}_lock`, LOCK_STATUS.LOCKED);
    res.status(200).json({
      type: 'success',
      message: 'Cycle Locked'
    });
  } catch (error) {
    res.status(500).json({
      type: 'error',
      error: 'Unable to lock cycle',
      message: error.message
    });
  }
});

router.put('/active/unlock', async (req, res) => {
  const { user } = req;

  try {
    const trip = await Trip.findOne({ user: user._id, ended: false });
    if (!trip) {
      throw new Error('No Active Trip');
    }

    if (String(trip.user) !== user._id) {
      throw new Error('You do not have permissions to access this trip');
    }

    const cycle = await Cycle.findById(trip.cycle);
    cycle.lock_status = LOCK_STATUS.UNLOCKED;
    await cycle.save();
    await setKey(`${cycle.cycle_id}_lock`, LOCK_STATUS.UNLOCKED);
    res.status(200).json({
      type: 'success',
      message: 'Cycle Unlocked'
    });
  } catch (error) {
    res.status(500).json({
      type: 'error',
      error: 'Unable to unlock cycle',
      message: error.message
    });
  }
});

router.put('/active/end', async (req, res) => {
  const { user } = req;

  try {
    const trip = await Trip.findOne({ user: user._id, ended: false }).populate('cycle');
    if (trip) {
      trip.ended = true;
      trip.end = Date.now();
      await trip.save();

      const curUser = await User.findById(user._id);
      curUser.credits -= trip.fare;
      curUser.save();

      const cycle = await Cycle.findById(trip.cycle);
      cycle.cycle_status = CYCLE_STATUS.AVAILABLE;
      cycle.lock_status = LOCK_STATUS.LOCKED;
      await cycle.save();
      await setKey(`${cycle.cycle_id}_status`, CYCLE_STATUS.AVAILABLE);
      await setKey(`${cycle.cycle_id}_lock`, LOCK_STATUS.LOCKED);

      res.status(200).json({
        type: 'success',
        message: 'Trip Ended'
      });
    } else {
      throw new Error('No Active Trip');
    }
  } catch (error) {
    res.status(500).json({
      type: 'error',
      error: 'Unable to end trip',
      message: error.message
    });
  }
});

module.exports = router;
