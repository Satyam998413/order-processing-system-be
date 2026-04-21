import multer from 'multer';
import path from 'path';
import { logger } from '../utils/logger.js';

// Configure storage
const storage = multer.memoryStorage(); // Store in memory for streaming

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'text/csv',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn(`Rejected file with mimetype: ${file.mimetype}`);
    cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

/**
 * Upload middleware for single file
 */
export const uploadFile = upload.single('file');

/**
 * File upload error handler
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error(`Multer error: ${err.message}`);
    return res.status(400).json({
      status: 'error',
      message: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    logger.error(`Upload error: ${err.message}`);
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }

  next();
};
