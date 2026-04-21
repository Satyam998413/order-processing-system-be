import { generateToken } from '../utils/jwt.js';
import { AuthenticationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Demo users (in production, use a database)
 */
const DEMO_USERS = {
  admin: {
    userId: '1',
    username: 'admin',
    password: 'admin123', // Only for demo purposes
    role: 'admin',
  },
  user: {
    userId: '2',
    username: 'user',
    password: 'user123',
    role: 'user',
  },
};

/**
 * Authenticate user
 */
export const authenticate = async (username, password) => {
  try {
    const user = DEMO_USERS[username];

    if (!user || user.password !== password) {
      throw new AuthenticationError('Invalid username or password');
    }

    const token = generateToken({
      userId: user.userId,
      username: user.username,
      role: user.role,
    });

    logger.info(`User authenticated: ${username}`);

    return {
      userId: user.userId,
      username: user.username,
      role: user.role,
      token,
    };
  } catch (err) {
    logger.error(`Authentication error: ${err.message}`);
    throw err;
  }
};

/**
 * Get all demo users (for development only)
 */
export const getDemoUsers = () => {
  return Object.entries(DEMO_USERS).map(([key, user]) => ({
    username: user.username,
    password: user.password,
  }));
};
