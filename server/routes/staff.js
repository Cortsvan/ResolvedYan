import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { supabaseAdmin } from '../index.js';

const router = express.Router();

/**
 * GET /api/staff/list
 * Protected endpoint for admins to fetch the staff list, including their pending status.
 */
router.get('/list', requireAuth, requireAdmin, async (req, res) => {
  try {
    // 1. Fetch all profiles that are staff or admin
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('role', ['staff', 'admin'])
      .order('created_at', { ascending: false });

    if (profileError) throw profileError;

    // 2. Fetch the auth status for each profile securely
    const staffWithStatus = await Promise.all(
      (profiles || []).map(async (profile) => {
        try {
          const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.id);
          
          if (userError || !user) return { ...profile, is_pending: false };

          // A user is considered pending if they haven't confirmed their email yet.
          // (Supabase sets email_confirmed_at when they click the invite link)
          const is_pending = !user.email_confirmed_at;

          return { ...profile, is_pending };
        } catch (err) {
          // If we fail to fetch a specific user, default to not pending
          return { ...profile, is_pending: false };
        }
      })
    );

    res.json({ success: true, staff: staffWithStatus });
  } catch (error) {
    console.error('Fetch staff error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch staff list' });
  }
});

/**
 * DELETE /api/staff/:id
 * Protected endpoint for admins to completely delete a staff member or cancel a pending invite.
 */
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Prevent deleting yourself
    if (req.user.sub === targetUserId) {
      return res.status(400).json({ error: "You cannot delete your own admin account." });
    }

    // Securely delete the user from Supabase Auth
    // This will typically cascade and delete their profile as well, depending on foreign keys.
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    
    if (deleteAuthError) throw deleteAuthError;

    // To be perfectly safe, also forcefully delete them from profiles
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', targetUserId);

    if (deleteProfileError) throw deleteProfileError;

    res.json({ success: true, message: 'Staff member successfully removed.' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete staff member' });
  }
});

export default router;
