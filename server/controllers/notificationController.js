import { supabaseAdmin } from '../config/supabase.js';

/**
 * GET /api/notifications
 * Returns the authenticated user's notifications, newest first.
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error(`❌ [getNotifications] DB error for user ${userId}:`, error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, notifications: data || [] });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read (strictly owned by user).
 */
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/notifications/read-all
 * Mark all of the current user's notifications as read.
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
