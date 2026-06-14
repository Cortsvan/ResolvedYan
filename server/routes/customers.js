import express from 'express';
import { requireAuth, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';
import { validate, uuidSchema } from '../middleware/validate.js';
import { 
  fetchCustomersList, 
  suspendCustomerAccount, 
  reactivateCustomerAccount, 
  deleteCustomerAccount, 
  resolveCustomerLiveChat 
} from '../controllers/customerController.js';

const router = express.Router();

/**
 * GET /api/customers/list
 * Protected endpoint for admins to fetch all customers, their ticket counts, and suspension status.
 */
router.get('/list', requireAuth, requireStaffOrAdmin, fetchCustomersList);

/**
 * POST /api/customers/:id/suspend
 * Securely suspends a user by enforcing a ban at the Auth level.
 */
router.post('/:id/suspend', requireAuth, requireStaffOrAdmin, validate(uuidSchema, 'params'), suspendCustomerAccount);

/**
 * POST /api/customers/:id/reactivate
 * Removes a suspension from a user at the Auth level.
 */
router.post('/:id/reactivate', requireAuth, requireStaffOrAdmin, validate(uuidSchema, 'params'), reactivateCustomerAccount);

/**
 * DELETE /api/customers/:id
 * Permanently deletes a customer.
 */
router.delete('/:id', requireAuth, requireAdmin, validate(uuidSchema, 'params'), deleteCustomerAccount);

/**
 * POST /api/customers/live-chat/:id/resolve
 * Securely resolves a live chat ticket and adds a system message.
 * This prevents malicious users from altering other fields like priority.
 */
router.post('/live-chat/:id/resolve', requireAuth, validate(uuidSchema, 'params'), resolveCustomerLiveChat);

export default router;
