import { getStaffList, removeStaffMember } from '../services/staffService.js';

export const fetchStaffList = async (req, res, next) => {
  try {
    const staff = await getStaffList();
    res.json({ success: true, staff });
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    await removeStaffMember(targetUserId, req.user.sub);
    res.json({ success: true, message: 'Staff member successfully removed.' });
  } catch (error) {
    if (error.message === 'You cannot delete your own admin account.') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};
