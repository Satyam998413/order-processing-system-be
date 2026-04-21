import express from 'express';
import { login, getDemoCredentials, verifyAuth } from '../controllers/authController.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login user and get JWT token
 */
router.post('/login', login);

/**
 * GET /api/auth/demo-credentials
 * Get demo user credentials (development only)
 */
router.get('/demo-credentials', getDemoCredentials);

/**
 * GET /api/auth/verify
 * Verify JWT token
 */
router.get('/verify', verifyAuth);

export default router;
