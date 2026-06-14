import { processStaffInvite } from '../services/inviteService.js';

export const inviteStaff = async (req, res, next) => {
  try {
    const { email, firstName, lastName } = req.body;
    const user = await processStaffInvite(email, firstName, lastName);
    
    res.json({
      success: true,
      message: `Staff invite sent to ${email}`,
      user
    });
  } catch (error) {
    if (error.message === 'Email is required') {
      return res.status(400).json({ error: error.message });
    }
    
    // Handle Supabase rate limits explicitly
    if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
      return res.status(429).json({ error: "Supabase email rate limit exceeded. Please wait a while before sending more invites." });
    }
    
    // Pass to global error handler
    next(error);
  }
};
