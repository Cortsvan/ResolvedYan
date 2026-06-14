import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate, uuidSchema } from '../middleware/validate.js';
import { fetchStaffList, deleteStaff } from '../controllers/staffController.js';

const router = express.Router();

/**
 * GET /api/staff/list
 * Protected endpoint for admins to fetch the staff list, including their pending status.
 */
router.get('/list', requireAuth, requireAdmin, fetchStaffList);

/**
 * DELETE /api/staff/:id
 * Protected endpoint for admins to completely delete a staff member or cancel a pending invite.
 */
router.delete('/:id', requireAuth, requireAdmin, validate(uuidSchema, 'params'), deleteStaff);

export default router;
