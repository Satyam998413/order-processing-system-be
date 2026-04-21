import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

/**
 * Generate JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiry,
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (err) {
    throw new Error(`Invalid token: ${err.message}`);
  }
};

/**
 * Decode JWT token without verification (use with caution)
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
