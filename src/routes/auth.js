const express = require('express');
const User = require('../models/User');
const bycrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const router = express.Router();

/**
 * @description Get logged in user
 * @route GET api/v1/auth/
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

/**
 * @description Authenticate user and send token
 * @route POST api/v1/auth/login
 * @access Public
 */
router.post(
  '/login',
  [
    check('email').isEmail(),
    check('password')
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, msg: errors.array()[0].msg });
    }

    try {
      let { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res
          .status(404)
          .json({ success: false, msg: 'Invalid credentials' });
      }

      let isMatch = await bycrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, msg: 'Invalid credentials' });
      }

      let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      res.status(200).json({ success: true, token });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, msg: error.message });
    }
  }
);

module.exports = router;
