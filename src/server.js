import { config } from './config/config.js';
import { logger } from './utils/logger.js';
import app, { initializeApp } from './app.js';
import { closeAllPools } from './config/database.js';

const PORT = config.port;

let server;

const startServer = async () => {
  try {
    // Initialize application
    await initializeApp();

    // Start server
    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// Handle process termination
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing connections...');

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      await closeAllPools();
      logger.info('Database connections closed');
      process.exit(0);
    });
  }

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after 10 seconds');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at ${promise}:`, reason);
  process.exit(1);
});

// Start the server
startServer();
