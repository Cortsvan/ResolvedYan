import { supabaseAdmin } from '../config/supabase.js';

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

    const isCustomer = profile?.role === 'customer';
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

    const isCustomer = profile?.role === 'customer';
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

    const { data, error } = await supabaseAdmin
      .from('tickets')
      .insert([{
        subject,
        category,
        description,
        status: 'Open',
        priority: 'Medium',
        customer_id: userId
      }])
      .select()
      .single();

    if (error) throw error;
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

    const isCustomer = profile?.role === 'customer';

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

    // Verify ticket access
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

    const isCustomer = profile?.role === 'customer';

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

    // Optionally update ticket's updated_at
    await supabaseAdmin
      .from('tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
