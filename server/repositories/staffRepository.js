import { supabaseAdmin } from '../config/supabase.js';

export const getStaffProfiles = async () => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .in('role', ['staff', 'admin'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const deleteUserAuth = async (userId) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
};

export const deleteUserProfile = async (userId) => {
  const { error } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (error) throw error;
};
