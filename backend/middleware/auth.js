// backend/middleware/auth.js

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format'
      });
    }

    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Token does not contain userId'
      });
    }

    req.userId = decoded.userId;

    console.log(
      '✅ Authenticated user:',
      req.userId
    );

    next();

  } catch (error) {

    console.error(
      '❌ Auth error:',
      error.message
    );

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};