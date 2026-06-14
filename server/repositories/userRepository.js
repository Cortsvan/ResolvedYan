import { supabaseAdmin } from '../config/supabase.js';

export const getUserById = async (id) => {
  const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(id);
  if (error) throw error;
  return user;
};
