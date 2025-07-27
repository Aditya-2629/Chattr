import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(protectRoute);

export default router;
