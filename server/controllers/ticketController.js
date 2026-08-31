import { supabaseAdmin } from '../config/supabase.js';
import { prioritizeTicket } from '../services/aiService.js';
import { notifyStaffAndAdmin, notifyUser } from '../services/notificationService.js';
import { sendTicketStatusEmail } from '../services/emailService.js';

const APP_URL = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

/**
 * Get ticket details
 */
export const getTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    const { data: ticket, error } = await supabaseAdmin
      .from('tickets')
      .select('*, profiles:customer_id (first_name, last_name, role)')
      .eq('id', id)
      .single();

    if (error) throw error;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isCustomer = profile?.role?.toLowerCase() === 'customer';
    if (isCustomer && ticket.customer_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

/**
 * Get ticket messages
 */
export const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    const { data: ticket, error: ticketErr } = await supabaseAdmin
      .from('tickets')
      .select('customer_id')
      .eq('id', id)
      .single();

    if (ticketErr || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isCustomer = profile?.role?.toLowerCase() === 'customer';
    if (isCustomer && ticket.customer_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    let query = supabaseAdmin
      .from('ticket_messages')
      .select('*, profiles:user_id (first_name, last_name, role)')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (isCustomer) {
      query = query.eq('is_internal', false);
    }

    const { data: messages, error } = await query;

    if (error) throw error;

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new ticket
 * Customers can create tickets for themselves.
 */
export const createTicket = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { subject, category, description } = req.body;

    // Priority only applies to regular support tickets.
    // Live Chat is real-time by nature — no severity classification needed.
    let aiPriority = null;
    if (category !== 'Live Chat') {
      try {
        aiPriority = await prioritizeTicket(subject, description);
      } catch (aiErr) {
        console.error("AI prioritization failed, defaulting to Medium:", aiErr.message);
        aiPriority = 'Medium';
      }
    }

    const { data, error } = await supabaseAdmin
      .from('tickets')
      .insert([{
        subject,
        category,
        description,
        status: 'Open',
        priority: aiPriority,
        customer_id: userId
      }])
      .select()
      .single();

    if (error) throw error;

    // --- Notifications ---
    const isLiveChat = category === 'Live Chat';

    if (isLiveChat) {
      await notifyStaffAndAdmin({
        title: 'New Live Chat',
        message: `A customer started a live chat: "${subject}"`,
        type: 'live_chat',
        ticketId: data.id,
      });
    } else {
      await notifyStaffAndAdmin({
        title: 'New Ticket Submitted',
        message: `A new ticket was submitted: "${subject}"`,
        type: 'new_ticket',
        ticketId: data.id,
      });
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a ticket's status (or priority)
 */
export const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    const { status, priority } = req.body;

    // Check caller role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isCustomer = profile?.role?.toLowerCase() === 'customer';

    // If customer, they can only reopen a ticket
    if (isCustomer) {
      if (status !== 'Open' || priority !== undefined) {
        return res.status(403).json({ error: 'Customers can only update status to Open' });
      }

      // Ensure they own the ticket
      const { data: ticket } = await supabaseAdmin
        .from('tickets')
        .select('customer_id')
        .eq('id', id)
        .single();
        
      if (!ticket || ticket.customer_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // Fetch current ticket before update
    const { data: existingTicket } = await supabaseAdmin
      .from('tickets')
      .select('subject, status, category, customer_id')
      .eq('id', id)
      .single();

    const updates = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;

    const { data, error } = await supabaseAdmin
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // --- Notifications & Email on status change ---
    if (status && existingTicket && status !== existingTicket.status) {
      const ticketOwnerId = existingTicket.customer_id;
      const ticketSubject = existingTicket.subject;

      // In-app notification → ticket owner
      await notifyUser({
        userId: ticketOwnerId,
        title: 'Ticket Status Updated',
        message: `Your ticket "${ticketSubject}" is now ${status}.`,
        type: 'ticket_status',
        ticketId: id,
      });

      // Email notification → ticket owner (non-Live-Chat tickets only)
      if (existingTicket.category !== 'Live Chat') {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(ticketOwnerId);
        if (authUser?.user?.email) {
          const { data: ownerProfile } = await supabaseAdmin
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', ticketOwnerId)
            .single();

          const toName = ownerProfile
            ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim()
            : 'Customer';

          await sendTicketStatusEmail({
            toEmail: authUser.user.email,
            toName,
            ticketId: id,
            subject: ticketSubject,
            status,
            appUrl: APP_URL,
          });
        }
      }
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a ticket permanently
 * Staff/Admin only
 */
export const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('tickets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * Post a message to a ticket
 */
export const postMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    const { message, is_internal } = req.body;

    // Fetch ticket with category and customer_id
    const { data: ticket, error: ticketErr } = await supabaseAdmin
      .from('tickets')
      .select('customer_id, category, subject')
      .eq('id', id)
      .single();

    if (ticketErr || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', userId)
      .single();

    const isCustomer = profile?.role?.toLowerCase() === 'customer' || ticket.customer_id === userId;

    if (isCustomer && ticket.customer_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (isCustomer && is_internal) {
      return res.status(403).json({ error: 'Customers cannot post internal messages' });
    }

    const { data, error } = await supabaseAdmin
      .from('ticket_messages')
      .insert([{
        ticket_id: id,
        user_id: userId,
        message,
        is_internal: is_internal || false
      }])
      .select()
      .single();

    if (error) throw error;

    // Update ticket's updated_at
    await supabaseAdmin
      .from('tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    // --- Notifications (only for non-internal messages) ---
    if (!is_internal) {
      const isLiveChat = ticket.category === 'Live Chat';
      const senderName = profile
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
        : 'User';

      if (isCustomer) {
        // Customer replied → notify all staff + admin
        await notifyStaffAndAdmin({
          title: isLiveChat ? 'Live Chat Reply' : 'Customer Replied',
          message: isLiveChat
            ? `Customer replied in live chat: "${ticket.subject}"`
            : `Customer replied on ticket: "${ticket.subject}"`,
          type: isLiveChat ? 'live_chat_reply' : 'ticket_reply',
          ticketId: id,
        });
      } else {
        // Staff/Admin replied → notify the ticket owner (customer)
        await notifyUser({
          userId: ticket.customer_id,
          title: isLiveChat ? 'Agent Replied in Chat' : 'Agent Replied to Your Ticket',
          message: isLiveChat
            ? `${senderName} replied in your live chat.`
            : `${senderName} replied to your ticket: "${ticket.subject}"`,
          type: isLiveChat ? 'live_chat_reply' : 'ticket_reply',
          ticketId: id,
        });
      }
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
