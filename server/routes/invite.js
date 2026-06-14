import express from 'express';
import { z } from 'zod';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { inviteStaff } from '../controllers/inviteController.js';

const router = express.Router();

const inviteStaffSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional()
});

/**
 * POST /api/invite/staff
 * Protected endpoint for admins to invite new staff members.
 * Uses the Supabase Service Role Key to bypass RLS and send an invite email.
 */
router.post('/staff', requireAuth, requireAdmin, validate(inviteStaffSchema), inviteStaff);

export default router;
