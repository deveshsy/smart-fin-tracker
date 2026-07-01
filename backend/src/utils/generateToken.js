/**
 * JWT Token Generator
 * -------------------
 * Utility function to create a signed JSON Web Token.
 * Encodes the user's ID as the payload and sets a 30-day expiry.
 * Used by auth routes after successful registration or login.
 */
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
