import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment files in order of priority
dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || 'dev'}`) });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_secret_key',
    expiry: process.env.JWT_EXPIRY || '7d',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
  sharding: {
    totalShards: 3,
    databases: ['orders_db_1', 'orders_db_2', 'orders_db_3'],
  },
};
