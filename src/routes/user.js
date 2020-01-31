const express = require('express');
const User = require('../models/User');
const bycrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const router = express.Router();

/**
 * @description Register user
 * @route POST api/v1/user/register
 * @access Public
 */
router.post(
  '/register',
  [
    check('name', 'Please enter a name')
      .not()
      .isEmpty(),
    check('email', 'Please enter a valid email')
      .isEmail()
      .normalizeEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, msg: errors.array()[0].msg });
    }

    try {
      const { name, email, password } = req.body;

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

      let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      res.status(200).json({ success: true, token });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, msg: error.message });
    }
  }
);

module.exports = router;
