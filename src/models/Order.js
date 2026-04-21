import { v4 as uuidv4 } from 'uuid';
import { getShardPool, getShardId } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from '../utils/errors.js';

/**
 * Order Model
 */
export class Order {
  constructor(data) {
    this.order_id = data.order_id || uuidv4();
    this.customer_id = data.customer_id;
    this.order_date = data.order_date || new Date().toISOString();
    this.order_amount = data.order_amount;
    this.status = data.status || 'pending';
  }

  /**
   * Save order to appropriate shard
   */
  async save() {
    try {
      const shardId = getShardId(this.customer_id);
      const pool = getShardPool(shardId);

      const query = `
        INSERT INTO orders (order_id, customer_id, order_date, order_amount, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;

      const values = [
        this.order_id,
        this.customer_id,
        this.order_date,
        this.order_amount,
        this.status,
      ];

      const result = await pool.query(query, values);
      logger.info(`Order saved: ${this.order_id} to shard ${shardId}`);
      return result.rows[0];
    } catch (err) {
      logger.error(`Failed to save order: ${err.message}`);
      throw new DatabaseError(`Failed to save order: ${err.message}`);
    }
  }

  /**
   * Get order by ID
   */
  static async findById(orderId, customerId) {
    try {
      const shardId = getShardId(customerId);
      const pool = getShardPool(shardId);

      const query = 'SELECT * FROM orders WHERE order_id = $1 AND customer_id = $2;';
      const result = await pool.query(query, [orderId, customerId]);

      return result.rows[0] || null;
    } catch (err) {
      logger.error(`Failed to find order: ${err.message}`);
      throw new DatabaseError(`Failed to find order: ${err.message}`);
    }
  }

  /**
   * Get orders by customer ID
   */
  static async findByCustomerId(customerId, limit = 100, offset = 0) {
    try {
      const shardId = getShardId(customerId);
      const pool = getShardPool(shardId);

      const query = `
        SELECT * FROM orders 
        WHERE customer_id = $1 
        ORDER BY order_date DESC 
        LIMIT $2 OFFSET $3;
      `;

      const result = await pool.query(query, [customerId, limit, offset]);
      return result.rows;
    } catch (err) {
      logger.error(`Failed to find orders: ${err.message}`);
      throw new DatabaseError(`Failed to find orders: ${err.message}`);
    }
  }

  /**
   * Batch insert orders
   */
  static async batchInsert(orders) {
    try {
      const ordersByShards = {};

      // Group orders by shard
      orders.forEach((order) => {
        const shardId = getShardId(order.customer_id);
        if (!ordersByShards[shardId]) {
          ordersByShards[shardId] = [];
        }
        ordersByShards[shardId].push(order);
      });

      let insertedCount = 0;
      const errors = [];

      // Insert orders into respective shards
      for (const [shardId, shardOrders] of Object.entries(ordersByShards)) {
        try {
          const pool = getShardPool(parseInt(shardId));

          const placeholders = shardOrders
            .map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`)
            .join(', ');

          const values = shardOrders.flatMap((order) => [
            order.order_id || uuidv4(),
            order.customer_id,
            order.order_date || new Date().toISOString(),
            order.order_amount,
            order.status || 'pending',
          ]);

          const query = `
            INSERT INTO orders (order_id, customer_id, order_date, order_amount, status)
            VALUES ${placeholders}
            RETURNING order_id;
          `;

          const result = await pool.query(query, values);
          insertedCount += result.rows.length;
          logger.info(`Inserted ${result.rows.length} orders into shard ${shardId}`);
        } catch (err) {
          logger.error(`Failed to insert orders into shard ${shardId}: ${err.message}`);
          errors.push({ shard: shardId, error: err.message });
        }
      }

      return { insertedCount, errors };
    } catch (err) {
      logger.error(`Batch insert failed: ${err.message}`);
      throw new DatabaseError(`Batch insert failed: ${err.message}`);
    }
  }
}
