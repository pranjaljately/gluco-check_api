const express = require('express');
const Notification = require('../models/Notification');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * @description Store push token for user
 * @route POST api/v1/notification/token
 * @access Private
 */
router.post(
  '/token',
  [
    auth,
    check('pushToken')
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
      const { pushToken } = req.body;

      const record = await Notification.findOne({
        user: req.userId,
        pushToken,
      });

      if (record) {
        return res
          .status(400)
          .json({ success: false, msg: 'Token already registered.' });
      }

      const notification = new Notification({
        user: req.userId,
        pushToken,
      });

      await notification.save();

      res.status(200).json({ success: true, notification });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, msg: 'Server error' });
    }
  }
);

/**
 * @description Set low notification preference
 * @route POST api/v1/notification/low
 * @access Private
 */
router.post(
  '/low',
  [auth, check('lowNotification').isBoolean()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, msg: errors.array()[0].msg });
    }

    try {
      const { lowNotification } = req.body;

      const notification = await Notification.findOne({ user: req.userId });
      notification.lowNotification = lowNotification;

      await notification.save();

      res.status(200).json({ success: true, notification });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, msg: 'Server error' });
    }
  }
);

/**
 * @description Set high notification preference
 * @route POST api/v1/notification/high
 * @access Private
 */
router.post(
  '/high',
  [auth, check('highNotification').isBoolean()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, msg: errors.array()[0].msg });
    }

    try {
      const { highNotification } = req.body;

      const notification = await Notification.findOne({ user: req.userId });
      notification.highNotification = highNotification;

      await notification.save();

      res.status(200).json({ success: true, notification });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, msg: 'Server error' });
    }
  }
);

module.exports = router;
