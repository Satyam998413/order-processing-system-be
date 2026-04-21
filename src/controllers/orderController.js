import { Order } from '../models/Order.js';
import {
  processFile,
  transformToOrders,
  validateOrders,
  batchOrders,
} from '../services/fileProcessingService.js';
import { logger } from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Upload and process orders
 */
export const uploadOrders = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    logger.info(`Processing file: ${req.file.originalname}`);

    // Process file
    const records = await processFile(req.file);
    logger.info(`Extracted ${records.length} records from file`);

    // Transform records
    const orders = transformToOrders(records);
    logger.info(`Transformed to ${orders.length} orders`);

    // Validate orders
    const { validOrders, errors } = validateOrders(orders);
    logger.info(`Validated: ${validOrders.length} valid, ${errors.length} invalid`);

    if (validOrders.length === 0) {
      throw new ValidationError('No valid orders to insert', errors);
    }

    // Batch orders for insertion
    const batches = batchOrders(validOrders, 500);
    logger.info(`Created ${batches.length} batches for insertion`);

    let totalInserted = 0;
    const batchResults = [];

    // Insert batches
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const result = await Order.batchInsert(batch);
      totalInserted += result.insertedCount;
      batchResults.push(result);

      logger.info(`Batch ${i + 1}/${batches.length}: Inserted ${result.insertedCount} orders`);
    }

    res.status(200).json({
      status: 'success',
      message: 'Orders uploaded successfully',
      data: {
        totalRecords: records.length,
        validOrders: validOrders.length,
        invalidOrders: errors.length,
        totalInserted,
        errors: errors.length > 0 ? errors.slice(0, 10) : [],
      },
    });
  } catch (err) {
    logger.error(`Upload orders error: ${err.message}`);
    next(err);
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { customerId } = req.query;

    if (!customerId) {
      throw new ValidationError('customerId query parameter is required');
    }

    const order = await Order.findById(orderId, customerId);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (err) {
    logger.error(`Get order error: ${err.message}`);
    next(err);
  }
};

/**
 * Get orders by customer ID
 */
export const getOrdersByCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.query;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    if (!customerId) {
      throw new ValidationError('customerId query parameter is required');
    }

    const orders = await Order.findByCustomerId(customerId, limit, offset);

    res.status(200).json({
      status: 'success',
      data: orders,
      count: orders.length,
    });
  } catch (err) {
    logger.error(`Get orders error: ${err.message}`);
    next(err);
  }
};

/**
 * Get stats (placeholder)
 */
export const getStats = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        message: 'Stats endpoint placeholder',
        totalShards: 3,
        description: 'Implement stats aggregation across shards as needed',
      },
    });
  } catch (err) {
    logger.error(`Get stats error: ${err.message}`);
    next(err);
  }
};
