import pg from 'pg';
import { config } from './config.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

// Create pool for each shard
const shardPools = {};

/**
 * Initialize database connections for all shards
 */
export const initializeShards = async () => {
  for (let i = 1; i <= config.sharding.totalShards; i++) {
    const shardName = `shard_${i}`;
    const dbName = `orders_db_${i}`;

    shardPools[shardName] = new Pool({
      user: config.db.user,
      password: config.db.password,
      host: config.db.host,
      port: config.db.port,
      database: dbName,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    try {
      const client = await shardPools[shardName].connect();
      await client.query('SELECT 1');
      client.release();
      logger.info(`Connected to ${dbName} (${shardName})`);
    } catch (err) {
      logger.error(`Failed to connect to ${dbName}: ${err.message}`);
      throw err;
    }
  }
};

/**
 * Get pool for a specific shard
 */
export const getShardPool = (shardId) => {
  const shardName = `shard_${shardId}`;
  if (!shardPools[shardName]) {
    throw new Error(`Shard ${shardId} not initialized`);
  }
  return shardPools[shardName];
};

/**
 * Close all database connections
 */
export const closeAllPools = async () => {
  for (const [shardName, pool] of Object.entries(shardPools)) {
    await pool.end();
    logger.info(`Closed connection to ${shardName}`);
  }
};

/**
 * Calculate shard ID for a customer
 */
export const getShardId = (customerId) => {
  const hash = customerId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % config.sharding.totalShards) + 1;
};

/**
 * Initialize database schema (create tables if not exists)
 */
export const initializeDatabaseSchema = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS orders (
      order_id UUID PRIMARY KEY,
      customer_id VARCHAR(255) NOT NULL,
      order_date TIMESTAMP NOT NULL,
      order_amount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_customer_id ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_order_date ON orders(order_date);
    CREATE INDEX IF NOT EXISTS idx_status ON orders(status);
  `;

  for (let i = 1; i <= config.sharding.totalShards; i++) {
    try {
      const pool = getShardPool(i);
      await pool.query(createTableQuery);
      logger.info(`Schema initialized for shard_${i}`);
    } catch (err) {
      logger.error(`Failed to initialize schema for shard_${i}: ${err.message}`);
    }
  }
};

export { shardPools };
