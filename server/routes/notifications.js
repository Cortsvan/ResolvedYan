import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate, uuidSchema } from '../middleware/validate.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Fetch current user's notifications (authenticated only)
 */
router.get('/', requireAuth, getNotifications);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read (authenticated only)
 */
router.put('/read-all', requireAuth, markAllAsRead);

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read (authenticated only + UUID validated)
 */
router.put('/:id/read', requireAuth, validate(uuidSchema, 'params'), markAsRead);

export default router;
