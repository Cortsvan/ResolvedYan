import { Resend } from 'resend';
import dotenv from 'dotenv';
import { generateTicketStatusEmailHtml, STATUS_STYLES } from '../templates/ticketStatusEmail.js';

dotenv.config();

/**
 * Send a clean, professional ticket status update email to the customer.
 *
 * @param {object} params
 * @param {string} params.toEmail  - Customer's email address
 * @param {string} params.toName   - Customer's display name
 * @param {string} params.ticketId - UUID of the ticket
 * @param {string} params.subject  - Ticket subject/title
 * @param {string} params.status   - New status
 * @param {string} params.appUrl   - Base URL of the frontend app
 */
export const sendTicketStatusEmail = async ({
  toEmail,
  toName,
  ticketId,
  subject,
  status,
  appUrl,
}) => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@yourdomain.com';

  if (!apiKey || apiKey === 'your_resend_api_key_here') {
    console.warn('⚠️ RESEND_API_KEY not configured — skipping email notification.');
    return;
  }

  const resend = new Resend(apiKey);
  const statusStyle = STATUS_STYLES[status] || { label: status };
  const shortId = ticketId.substring(0, 8).toUpperCase();

  // Generate HTML from the dedicated template module
  const html = generateTicketStatusEmailHtml({
    toName,
    ticketId,
    subject,
    status,
    appUrl,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `[Ticket #${shortId}] Status updated to ${statusStyle.label}`,
      html,
    });
    if (error) {
      console.error('❌ Resend email error:', error);
    } else {
      console.log(`✉️ Ticket status email sent to ${toEmail} (ID: ${data?.id})`);
    }
  } catch (err) {
    console.error('❌ Failed to send status email:', err.message);
  }
};
