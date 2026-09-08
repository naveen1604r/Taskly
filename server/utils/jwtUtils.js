import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * Generate a signed JWT access token with minimal payload
 * @param {Object} user - User record ({ id, email })
 * @returns {string} Signed JWT token
 */
export const generateToken = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

export default {
  generateToken,
  verifyToken,
};
