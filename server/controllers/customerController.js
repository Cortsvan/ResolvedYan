import { getCustomersList, suspendCustomer, reactivateCustomer, removeCustomer } from '../services/customerService.js';
import { resolveLiveChat } from '../services/ticketService.js';

export const fetchCustomersList = async (req, res, next) => {
  try {
    const customers = await getCustomersList();
    res.json({ success: true, customers });
  } catch (error) {
    next(error);
  }
};

export const suspendCustomerAccount = async (req, res, next) => {
  try {
    await suspendCustomer(req.params.id);
    res.json({ success: true, message: 'Customer account suspended.' });
  } catch (error) {
    next(error);
  }
};

export const reactivateCustomerAccount = async (req, res, next) => {
  try {
    await reactivateCustomer(req.params.id);
    res.json({ success: true, message: 'Customer account reactivated.' });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomerAccount = async (req, res, next) => {
  try {
    await removeCustomer(req.params.id);
    res.json({ success: true, message: 'Customer successfully deleted.' });
  } catch (error) {
    next(error);
  }
};

export const resolveCustomerLiveChat = async (req, res, next) => {
  try {
    await resolveLiveChat(req.params.id, req.user.sub);
    res.json({ success: true, message: 'Chat resolved securely' });
  } catch (error) {
    if (error.message === 'Ticket not found') return res.status(404).json({ error: error.message });
    if (error.message === 'Unauthorized to resolve this chat') return res.status(403).json({ error: error.message });
    if (error.message === 'Not a Live Chat ticket') return res.status(400).json({ error: error.message });
    next(error);
  }
};
