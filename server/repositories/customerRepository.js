import { supabaseAdmin } from '../config/supabase.js';

export const getCustomerProfilesWithTickets = async () => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      tickets!tickets_customer_id_fkey (id, status, category)
    `)
    .eq('role', 'customer')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateAuthUser = async (userId, updates) => {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates);
  if (error) throw error;
  return data;
};

export const deleteAuthUser = async (userId) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
};

export const deleteProfile = async (userId) => {
  const { error } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (error) throw error;
};

export const listAllAuthUsers = async () => {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000
  });
  if (error) throw error;
  return data.users || [];
};
