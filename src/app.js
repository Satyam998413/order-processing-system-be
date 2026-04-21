import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/config.js';
import { initializeShards, initializeDatabaseSchema } from './config/database.js';
import { loggingMiddleware, errorMiddleware } from './middlewares/auth.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { logger } from './utils/logger.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Processing System API',
      version: '1.0.0',
      description: 'Sharded order ingestion system API documentation',
      contact: {
        name: 'Satyam Baranwal',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/docs/swagger.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Order Processing System API',
    documentation: `http://localhost:${config.port}/api-docs`,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handler
app.use(errorMiddleware);

// Initialize database on startup
export const initializeApp = async () => {
  try {
    await initializeShards();
    await initializeDatabaseSchema();
    logger.info('Application initialized successfully');
  } catch (err) {
    logger.error(`Failed to initialize application: ${err.message}`);
    process.exit(1);
  }
};

export default app;
