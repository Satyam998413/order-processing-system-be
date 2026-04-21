import { authenticate, getDemoUsers } from '../services/authService.js';
import { logger } from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }

    const user = await authenticate(username, password);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: user,
    });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    next(err);
  }
};

/**
 * Get demo users and credentials
 */
export const getDemoCredentials = async (req, res, next) => {
  try {
    const users = getDemoUsers();

    res.status(200).json({
      status: 'success',
      message: 'Demo credentials (development only)',
      data: users,
    });
  } catch (err) {
    logger.error(`Get demo credentials error: ${err.message}`);
    next(err);
  }
};

/**
 * Verify token
 */
export const verifyAuth = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Token is valid',
      data: req.user,
    });
  } catch (err) {
    logger.error(`Verify auth error: ${err.message}`);
    next(err);
  }
};
