import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { supabaseAdmin } from '../index.js';

const router = express.Router();

/**
 * POST /api/invite/staff
 * Protected endpoint for admins to invite new staff members.
 * Uses the Supabase Service Role Key to bypass RLS and send an invite email.
 */
router.post('/staff', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Use the Supabase Admin client to invite a user by email
    // This requires the Service Role Key!
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: 'staff'
      },
      redirectTo: 'http://localhost:5173/reset-password'
    });

    if (error) throw error;

    if (data && data.user) {
      // Force update the profile to 'staff' in case the database trigger defaults it to 'customer'
      await supabaseAdmin
        .from('profiles')
        .update({ role: 'staff' })
        .eq('id', data.user.id);
    }

    res.json({
      success: true,
      message: `Staff invite sent to ${email}`,
      user: data.user
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: error.message || 'Failed to send invite' });
  }
});

export default router;
