import { supabaseAdmin } from '../config/supabase.js';

export const inviteUser = async (email, firstName, lastName) => {
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      first_name: firstName,
      last_name: lastName,
      role: 'staff'
    },
    redirectTo: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/reset-password`
  });
  if (error) throw error;
  return data;
};

export const updateProfileRoleToStaff = async (userId) => {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: 'staff' })
    .eq('id', userId);
  if (error) throw error;
};
