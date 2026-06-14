import { 
  getCustomerProfilesWithTickets, 
  listAllAuthUsers, 
  updateAuthUser, 
  deleteAuthUser, 
  deleteProfile 
} from '../repositories/customerRepository.js';

export const getCustomersList = async () => {
  const profiles = await getCustomerProfilesWithTickets();
  const authUsers = await listAllAuthUsers();
  
  const authMap = new Map(authUsers.map(u => [u.id, u]));

  const customersWithStatus = profiles.map(profile => {
    const authUser = authMap.get(profile.id);
    
    // Calculate total tickets
    const ticketCount = profile.tickets ? profile.tickets.length : 0;
    
    // Check if suspended
    let is_suspended = false;
    if (authUser && authUser.banned_until) {
      const bannedDate = new Date(authUser.banned_until);
      if (bannedDate > new Date()) {
        is_suspended = true;
      }
    }

    // Remove raw tickets array
    const { tickets, ...profileData } = profile;

    return {
      ...profileData,
      ticketCount,
      is_suspended,
      last_sign_in_at: authUser?.last_sign_in_at || null
    };
  });

  return customersWithStatus;
};

export const suspendCustomer = async (userId) => {
  await updateAuthUser(userId, { ban_duration: '876000h' });
};

export const reactivateCustomer = async (userId) => {
  await updateAuthUser(userId, { ban_duration: 'none' });
};

export const removeCustomer = async (userId) => {
  await deleteAuthUser(userId);
  await deleteProfile(userId);
};
