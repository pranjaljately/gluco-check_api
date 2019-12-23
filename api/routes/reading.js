const express = require('express');
const Reading = require('../models/Reading');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * @description Record new reading
 * @route POST api/v1/reading
 * @access Private
 */
router.post(
  '/',
  [
    auth,
    check('reading', 'Reading must be a positive numeric value').isFloat({
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
      const { reading, readingTime } = req.body;

      const readingRecord = new Reading({
        user: req.userId,
        reading,
        readingTime,
      });

      await readingRecord.save();

      res.status(200).json({ success: true, readingRecord });
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
      .select('reading readingTime')
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
        .select('reading readingTime')
        .sort({
          readingTime: 'desc',
        });

      res.status(200).json({ success: true, readings });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, msg: 'Server error' });
    }
  }
);

module.exports = router;
