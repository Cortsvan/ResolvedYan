import { getUserById } from '../repositories/userRepository.js';

export const verifyUserStatus = async (userId) => {
  const user = await getUserById(userId);
  if (!user) throw new Error('User not found');
  
  if (user.banned_until && new Date(user.banned_until) > new Date()) {
    throw new Error('User is suspended');
  }
  return true;
};
