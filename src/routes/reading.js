const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading');
const oneDecimalPlace = require('../utils/numberFormat');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const sendNotification = require('../utils/sendNotification');

/**
 * @description Record new reading
 * @route POST api/v1/reading
 * @access Private
 */
router.post(
  '/',
  [
    auth,
    check('value', 'Value must be a positive numeric number').isFloat({
      gt: 0,
    }),
    check('readingTime', 'Invalid reading time, must be a Unix timestamp')
      .isNumeric()
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, msg: errors.array()[0].msg });
    }

    try {
      const { value, readingTime } = req.body;

      const reading = new Reading({
        user: req.userId,
        value: oneDecimalPlace(value),
        readingTime,
      });

      await reading.save();

      const notification = await Notification.findOne({ user: req.userId });

      if (notification) {
        const { pushToken, highNotification, lowNotification } = notification;
        if (
          (checkIfHigh(value) && highNotification) ||
          (checkIfLow(value) && lowNotification)
        ) {
          await sendNotification(pushToken, value);
        }
      }

      res.status(200).json({ success: true, reading });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, msg: 'Server error' });
    }
  }
);

/**
 * @description Get all readings
 * @route GET api/v1/reading
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const readings = await Reading.find({ user: req.userId })
      .select('value readingTime')
      .sort({
        readingTime: 'desc',
      });
    res.status(200).json({ success: true, readings });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

/**
 * @description Get readings within specific dates
 * @route GET api/v1/reading/:from-:to
 * @access Private
 */
router.get(
  '/:from-:to',
  [
    auth,
    check(['from', 'to'], 'Invalid date, must be a Unix timestamp')
      .isNumeric()
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, msg: errors.array()[0].msg });
    }

    try {
      let { from, to } = req.params;

      const readings = await Reading.find({
        user: req.userId,
        readingTime: { $gte: from, $lte: to },
      })
        .select('value readingTime')
        .sort({
          readingTime: 'desc',
        });

      let data = calculations(readings);

      res.status(200).json({ success: true, readings, data });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, msg: 'Server error' });
    }
  }
);

const calculations = readings => {
  let highEventsCount = 0;
  let lowEventsCount = 0;
  let inTargetEventsCount = 0;
  let numberOfReadings = 1;
  let average = 0;

  if (readings.length !== 0) {
    numberOfReadings = readings.length;

    average =
      readings.reduce((accumulator, reading) => {
        if (checkIfHigh(reading.value)) {
          highEventsCount++;
        } else {
          if (checkIfLow(reading.value)) lowEventsCount++;
        }

        return accumulator + reading.value;
      }, 0) / numberOfReadings;

    inTargetEventsCount = numberOfReadings - (highEventsCount + lowEventsCount);
  }

  return {
    average: oneDecimalPlace(average),
    highEventsCount,
    lowEventsCount,
    inTargetEventsCount,
    A1C: calculateA1C(average),
    distribution: {
      low: Math.round((lowEventsCount / numberOfReadings) * 100),
      target: Math.round((inTargetEventsCount / numberOfReadings) * 100),
      high: Math.round((highEventsCount / numberOfReadings) * 100),
    },
  };
};

const checkIfHigh = value => value > 7.0;
const checkIfLow = value => value < 4.0;

const calculateA1C = value => {
  let A1C = (value * 18 + 46.7) / 28.7;
  return oneDecimalPlace(A1C);
};

module.exports = router;
