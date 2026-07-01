/**
 * Authentication Middleware
 * ------------------------
 * Protects routes by verifying JWT tokens from the Authorization header.
 * Extracts the Bearer token, decodes it, and attaches the authenticated
 * user's ID to `req.user` for downstream route handlers to use.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  let token;

  // Check for Bearer token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to the request (exclude password from the lookup)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        return next(new Error('User not found'));
      }

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('Not authorized, token invalid'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }
};

module.exports = auth;
