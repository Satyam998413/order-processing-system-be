import { Readable } from 'stream';
import { parse } from 'csv-parse';
import XLSX from 'xlsx';
import { logger } from '../utils/logger.js';

/**
 * Parse CSV stream
 */
export const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const records = [];
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      delimiter: ',',
    });

    const stream = Readable.from([buffer]);

    stream.pipe(parser);

    parser.on('readable', function () {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    parser.on('error', (err) => {
      logger.error(`CSV parsing error: ${err.message}`);
      reject(err);
    });

    parser.on('end', () => {
      resolve(records);
    });
  });
};

/**
 * Parse Excel file
 */
export const parseExcel = (buffer) => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(worksheet);

    logger.info(`Parsed ${records.length} records from Excel file`);
    return records;
  } catch (err) {
    logger.error(`Excel parsing error: ${err.message}`);
    throw err;
  }
};

/**
 * Process file based on type
 */
export const processFile = async (file) => {
  try {
    let records = [];

    if (file.mimetype === 'text/csv' || file.mimetype === 'text/plain') {
      records = await parseCSV(file.buffer);
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      records = parseExcel(file.buffer);
    }

    logger.info(`Processed file: ${file.originalname}, Records: ${records.length}`);
    return records;
  } catch (err) {
    logger.error(`File processing error: ${err.message}`);
    throw err;
  }
};

/**
 * Transform records to order format
 */
export const transformToOrders = (records) => {
  return records
    .map((record) => {
      try {
        return {
          customer_id: record.customer_id || record.customerId || '',
          order_date: record.order_date || record.orderDate || new Date().toISOString(),
          order_amount: parseFloat(record.order_amount || record.orderAmount || 0),
          status: record.status || 'pending',
        };
      } catch (err) {
        logger.warn(`Failed to transform record: ${JSON.stringify(record)}`);
        return null;
      }
    })
    .filter((order) => order !== null && order.customer_id && order.order_amount > 0);
};

/**
 * Validate orders
 */
export const validateOrders = (orders) => {
  const errors = [];
  const validOrders = [];

  orders.forEach((order, index) => {
    try {
      if (!order.customer_id) {
        errors.push(`Row ${index + 1}: Missing customer_id`);
        return;
      }

      if (typeof order.order_amount !== 'number' || order.order_amount <= 0) {
        errors.push(`Row ${index + 1}: Invalid order_amount`);
        return;
      }

      validOrders.push(order);
    } catch (err) {
      errors.push(`Row ${index + 1}: ${err.message}`);
    }
  });

  return { validOrders, errors };
};

/**
 * Batch orders for insertion
 */
export const batchOrders = (orders, batchSize = 500) => {
  const batches = [];
  for (let i = 0; i < orders.length; i += batchSize) {
    batches.push(orders.slice(i, i + batchSize));
  }
  return batches;
};
