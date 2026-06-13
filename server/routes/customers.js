import express from 'express';
import { requireAuth, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';
import { supabaseAdmin } from '../index.js';

const router = express.Router();

/**
 * GET /api/customers/list
 * Protected endpoint for admins to fetch all customers, their ticket counts, and suspension status.
 */
router.get('/list', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    // 1. Fetch all customer profiles and their total tickets
    // The inner select tickets(id) allows us to count them efficiently
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        tickets!tickets_customer_id_fkey (id)
      `)
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (profileError) throw profileError;

    // 2. Fetch all users from Supabase Auth to get their true 'banned' status
    // Using listUsers is much more efficient than fetching them one by one for customers
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000 // Safely fetch a large batch
    });

    if (authError) throw authError;

    const authUsers = authData?.users || [];
    const authMap = new Map(authUsers.map(u => [u.id, u]));

    // 3. Merge the data
    const customersWithStatus = profiles.map(profile => {
      const authUser = authMap.get(profile.id);
      
      // Calculate total tickets
      const ticketCount = profile.tickets ? profile.tickets.length : 0;
      
      // Check if suspended (banned_until exists and is in the future)
      let is_suspended = false;
      if (authUser && authUser.banned_until) {
        const bannedDate = new Date(authUser.banned_until);
        if (bannedDate > new Date()) {
          is_suspended = true;
        }
      }

      // Remove the raw tickets array to save bandwidth, just keep the count
      const { tickets, ...profileData } = profile;

      return {
        ...profileData,
        ticketCount,
        is_suspended,
        last_sign_in_at: authUser?.last_sign_in_at || null
      };
    });

    res.json({ success: true, customers: customersWithStatus });
  } catch (error) {
    console.error('Fetch customers error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch customer list' });
  }
});

/**
 * POST /api/customers/:id/suspend
 * Securely suspends a user by enforcing a ban at the Auth level.
 */
router.post('/:id/suspend', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Ban the user for 100 years (876000h)
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      ban_duration: '876000h'
    });

    if (error) throw error;

    res.json({ success: true, message: 'Customer account suspended.' });
  } catch (error) {
    console.error('Suspend error:', error);
    res.status(500).json({ error: error.message || 'Failed to suspend customer' });
  }
});

/**
 * POST /api/customers/:id/reactivate
 * Removes a suspension from a user at the Auth level.
 */
router.post('/:id/reactivate', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Remove the ban
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      ban_duration: 'none'
    });

    if (error) throw error;

    res.json({ success: true, message: 'Customer account reactivated.' });
  } catch (error) {
    console.error('Reactivate error:', error);
    res.status(500).json({ error: error.message || 'Failed to reactivate customer' });
  }
});

/**
 * DELETE /api/customers/:id
 * Permanently deletes a customer.
 */
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    if (deleteAuthError) throw deleteAuthError;

    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', targetUserId);

    if (deleteProfileError) throw deleteProfileError;

    res.json({ success: true, message: 'Customer successfully deleted.' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete customer' });
  }
});

/**
 * POST /api/customers/live-chat/:id/resolve
 * Securely resolves a live chat ticket and adds a system message.
 * This prevents malicious users from altering other fields like priority.
 */
router.post('/live-chat/:id/resolve', requireAuth, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.sub;

    // 1. Verify the ticket exists and is a Live Chat
    const { data: ticket, error: fetchError } = await supabaseAdmin
      .from('tickets')
      .select('customer_id, category')
      .eq('id', ticketId)
      .single();

    if (fetchError || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // 2. Verify ownership or staff/admin role
    if (ticket.customer_id !== userId) {
       const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).single();
       if (profile?.role !== 'staff' && profile?.role !== 'admin') {
         return res.status(403).json({ error: 'Unauthorized to resolve this chat' });
       }
    }

    if (ticket.category !== 'Live Chat') {
      return res.status(400).json({ error: 'Not a Live Chat ticket' });
    }

    // 3. Safely UPDATE ONLY the status
    const { error: updateError } = await supabaseAdmin
      .from('tickets')
      .update({ status: 'Resolved' })
      .eq('id', ticketId);

    if (updateError) throw updateError;

    // 4. Insert system message
    const { error: msgError } = await supabaseAdmin
      .from('ticket_messages')
      .insert([{
        ticket_id: ticketId,
        user_id: userId,
        message: ticket.customer_id === userId 
          ? "System: The customer has ended the chat." 
          : "System: The agent has resolved this chat.",
        is_internal: false
      }]);

    if (msgError) throw msgError;

    res.json({ success: true, message: 'Chat resolved securely' });
  } catch (error) {
    console.error('Resolve chat error:', error);
    res.status(500).json({ error: 'Failed to resolve chat' });
  }
});

export default router;
