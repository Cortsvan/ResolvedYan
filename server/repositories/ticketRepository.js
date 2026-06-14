import { supabaseAdmin } from '../config/supabase.js';

export const getTicketById = async (ticketId) => {
  const { data, error } = await supabaseAdmin
    .from('tickets')
    .select('customer_id, category')
    .eq('id', ticketId)
    .single();
  if (error) throw error;
  return data;
};

export const updateTicketStatus = async (ticketId, status) => {
  const { error } = await supabaseAdmin
    .from('tickets')
    .update({ status })
    .eq('id', ticketId);
  if (error) throw error;
};

export const insertTicketMessage = async (ticketId, userId, message, isInternal) => {
  const { error } = await supabaseAdmin
    .from('ticket_messages')
    .insert([{
      ticket_id: ticketId,
      user_id: userId,
      message,
      is_internal: isInternal
    }]);
  if (error) throw error;
};

export const getUserRole = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (error) return null;
  return data?.role;
};
