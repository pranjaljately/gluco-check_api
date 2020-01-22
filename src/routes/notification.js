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

      const record = await Notification.findOne({ pushToken });

      if (record) {
        return res
          .status(400)
          .json({ success: false, msg: 'Token already registered.' });
      }

      const notificationPreferences = new Notification({
        user: req.userId,
        pushToken,
      });

      await notificationPreferences.save();

      res.status(200).json({ success: true, notificationPreferences });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, msg: 'Server error' });
    }
  }
);

module.exports = router;
