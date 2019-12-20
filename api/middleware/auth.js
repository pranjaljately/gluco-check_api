const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res
      .status(401)
      .json({ success: false, msg: 'No token, authorisation denied' });
  }

  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ success: false, msg: 'Invalid token' });
  }
};

module.exports = auth;
