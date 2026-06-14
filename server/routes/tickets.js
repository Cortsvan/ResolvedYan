import express from 'express';
import { z } from 'zod';
import { requireAuth, requireStaffOrAdmin } from '../middleware/auth.js';
import { validate, uuidSchema } from '../middleware/validate.js';
import { 
  createTicket, 
  updateTicket, 
  deleteTicket, 
  postMessage 
} from '../controllers/ticketController.js';

const router = express.Router();

// Validation Schemas
const createTicketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(5, "Description must be at least 5 characters")
});

const updateTicketSchema = z.object({
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional()
});

const postMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(3000),
  is_internal: z.boolean().optional()
});

/**
 * POST /api/tickets
 * Create a new ticket (Customer or Agent)
 */
router.post('/', requireAuth, validate(createTicketSchema), createTicket);

/**
 * PUT /api/tickets/:id
 * Update a ticket's status or priority
 */
router.put('/:id', requireAuth, validate(uuidSchema, 'params'), validate(updateTicketSchema), updateTicket);

/**
 * DELETE /api/tickets/:id
 * Permanently delete a ticket (Staff/Admin only)
 */
router.delete('/:id', requireAuth, requireStaffOrAdmin, validate(uuidSchema, 'params'), deleteTicket);

/**
 * POST /api/tickets/:id/messages
 * Post a message to a ticket
 */
router.post('/:id/messages', requireAuth, validate(uuidSchema, 'params'), validate(postMessageSchema), postMessage);

export default router;
