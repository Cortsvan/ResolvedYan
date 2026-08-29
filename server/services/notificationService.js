import { supabaseAdmin } from '../config/supabase.js';

/**
 * Fetch all staff and admin user IDs from the profiles table.
 * Handles both lowercase ('staff', 'admin') and capitalized ('Staff', 'Admin').
 */
const getStaffAndAdminIds = async () => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .or('role.eq.staff,role.eq.admin,role.eq.Staff,role.eq.Admin');
    
  if (error) {
    console.error('❌ [Notification] Error querying staff/admin profiles:', error.message);
    return [];
  }
  
  const ids = data ? data.map(p => p.id) : [];
  return ids;
};

/**
 * Insert a single notification for one user.
 */
const insertNotification = async ({ userId, title, message, type, ticketId }) => {
  if (!userId) {
    console.warn('⚠️ [Notification] Attempted to insert notification without userId');
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type,
      ticket_id: ticketId || null,
      is_read: false
    })
    .select();

  if (error) {
    console.error('❌ [Notification] Database insert failed:', error.message);
    return null;
  }

  return data?.[0];
};

/**
 * Notify all staff and admin members.
 */
export const notifyStaffAndAdmin = async ({ title, message, type, ticketId }) => {
  try {
    const ids = await getStaffAndAdminIds();
    if (!ids || ids.length === 0) {
      console.warn('⚠️ [Notification] No staff/admin accounts found in profiles table');
      return;
    }
    await Promise.all(
      ids.map(userId => insertNotification({ userId, title, message, type, ticketId }))
    );
  } catch (err) {
    console.error('❌ [Notification] notifyStaffAndAdmin error:', err.message);
  }
};

/**
 * Notify a single specific user.
 */
export const notifyUser = async ({ userId, title, message, type, ticketId }) => {
  try {
    await insertNotification({ userId, title, message, type, ticketId });
  } catch (err) {
    console.error('❌ [Notification] notifyUser error:', err.message);
  }
};
