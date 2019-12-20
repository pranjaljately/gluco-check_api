const express = require('express');
const User = require('../models/User');
const bycrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const router = express.Router();

/**
 * @description Register user
 * @route POST api/v1/users/register
 * @access Public
 */
router.post(
  '/register',
  [
    check('name', 'Please enter a name')
      .not()
      .isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ success: false, msg: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ success: false, msg: 'Email already in use' });
      }
      user = new User({
        name,
        email,
        password,
      });

      user.password = await bycrypt.hash(password, 10);
      await user.save();

      let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      res.status(200).send({ success: true, token });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, msg: error.message });
    }
  }
);

/**
 * @description Authenticate user and send token
 * @route POST api/v1/users/login
 * @access Public
 */
router.post(
  '/login',
  [check('email').isEmail(), check('password').exists()],
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
          .status(401)
          .json({ success: false, msg: 'Invalidal credentials' });
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

      res.status(200).send({ success: true, token });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, msg: error.message });
    }
  }
);
module.exports = router;
