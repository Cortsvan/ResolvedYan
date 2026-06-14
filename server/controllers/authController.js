import { verifyUserStatus } from '../services/authService.js';
import { supabaseAdmin } from '../config/supabase.js';

export const verifyAuth = async (req, res, next) => {
  try {
    await verifyUserStatus(req.user.sub);
    res.json({ success: true, valid: true });
  } catch (error) {
    if (error.message === 'User not found' || error.message === 'User is suspended') {
      return res.status(401).json({ error: error.message });
    }
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { first_name, last_name, avatar_url } = req.body;

    const updates = {};
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
