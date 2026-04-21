import { verifyToken } from '../utils/jwt.js';
import { AuthenticationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * JWT Authentication middleware
 */
export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    logger.debug(`User authenticated: ${decoded.userId}`);
    next();
  } catch (err) {
    logger.error(`Authentication failed: ${err.message}`);
    res.status(401).json({
      status: 'error',
      message: err.message,
    });
  }
};

/**
 * Optional auth middleware
 */
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
      logger.debug(`User authenticated: ${decoded.userId}`);
    }
  } catch (err) {
    logger.debug(`Optional auth skipped: ${err.message}`);
  }
  next();
};

/**
 * Error handling middleware
 */
export const errorMiddleware = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

/**
 * Request logging middleware
 */
export const loggingMiddleware = (req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
};
