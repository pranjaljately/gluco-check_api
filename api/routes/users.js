const express = require('express');
const router = express.Router();

/**
 * @route POST api/v1/users
 * @description Register a user
 * @access Public
 */
router.get('/', (req, res) => {
  res.status(200).json({ success: 'Testing user endpoint...' });
});

module.exports = router;
