import express from 'express';
import { uploadOrders, getOrderById, getOrdersByCustomer, getStats } from '../controllers/orderController.js';
import { uploadFile, handleUploadError } from '../middlewares/upload.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

/**
 * POST /api/orders/upload
 * Upload CSV/Excel file with orders
 * Auth: Required
 */
router.post('/upload', authMiddleware, uploadFile, handleUploadError, uploadOrders);

/**
 * GET /api/orders/:orderId
 * Get order by ID
 * Query: customerId (required)
 * Auth: Required
 */
router.get('/:orderId', authMiddleware, getOrderById);

/**
 * GET /api/orders
 * Get orders by customer ID
 * Query: customerId (required), limit, offset
 * Auth: Required
 */
router.get('/', authMiddleware, getOrdersByCustomer);

/**
 * GET /api/orders/stats
 * Get statistics
 * Auth: Required
 */
router.get('/stats/overview', authMiddleware, getStats);

export default router;
