import { inviteUser, updateProfileRoleToStaff } from '../repositories/inviteRepository.js';

export const processStaffInvite = async (email, firstName, lastName) => {
  if (!email) throw new Error('Email is required');
  
  const data = await inviteUser(email, firstName, lastName);
  
  if (data && data.user) {
    // Force update the profile to 'staff' in case the database trigger defaults it to 'customer'
    await updateProfileRoleToStaff(data.user.id);
  }
  
  return data.user;
};
