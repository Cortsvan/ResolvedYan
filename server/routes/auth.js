import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { verifyAuth, updateProfile } from '../controllers/authController.js';

const router = express.Router();

router.get('/verify', requireAuth, verifyAuth);
router.put('/profile', requireAuth, updateProfile);

export default router;
