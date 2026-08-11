import { getStaffProfiles, getProfileById, deleteUserAuth, deleteUserProfile } from '../repositories/staffRepository.js';
import { getUserById } from '../repositories/userRepository.js';

export const getStaffList = async () => {
  const profiles = await getStaffProfiles();

  const staffWithStatus = await Promise.all(
    (profiles || []).map(async (profile) => {
      try {
        const user = await getUserById(profile.id);
        const is_pending = !user.email_confirmed_at;
        return { ...profile, is_pending };
      } catch (err) {
        return { ...profile, is_pending: false };
      }
    })
  );

  return staffWithStatus;
};

export const removeStaffMember = async (targetUserId, requestingUserId) => {
  if (requestingUserId === targetUserId) {
    throw new Error('You cannot delete your own admin account.');
  }

  const targetProfile = await getProfileById(targetUserId);
  if (targetProfile && targetProfile.role === 'admin') {
    throw new Error('You cannot remove other administrators.');
  }

  await deleteUserAuth(targetUserId);
  await deleteUserProfile(targetUserId);
};
