import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { checkout } from '../controllers/payment.controller.js';

const router = express.Router();
router.post('/checkout', authMiddleware, checkout);

export default router;
