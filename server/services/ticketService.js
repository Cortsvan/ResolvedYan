import { getTicketById, updateTicketStatus, insertTicketMessage, getUserRole } from '../repositories/ticketRepository.js';

export const resolveLiveChat = async (ticketId, userId) => {
  // 1. Verify the ticket exists
  let ticket;
  try {
    ticket = await getTicketById(ticketId);
  } catch (err) {
    throw new Error('Ticket not found');
  }

  // 2. Verify ownership or staff/admin role
  if (ticket.customer_id !== userId) {
     const role = await getUserRole(userId);
     if (role !== 'staff' && role !== 'admin') {
       throw new Error('Unauthorized to resolve this chat');
     }
  }

  if (ticket.category !== 'Live Chat') {
    throw new Error('Not a Live Chat ticket');
  }

  // 3. Safely UPDATE ONLY the status
  await updateTicketStatus(ticketId, 'Resolved');

  // 4. Insert system message
  const message = ticket.customer_id === userId 
    ? "System: The customer has ended the chat." 
    : "System: The agent has resolved this chat.";
    
  await insertTicketMessage(ticketId, userId, message, false);
};
