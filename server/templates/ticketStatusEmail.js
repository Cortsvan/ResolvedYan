/**
 * Escape user-supplied strings before embedding in HTML.
 * Prevents HTML injection in email templates.
 */
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Status styling map for clean badge rendering.
 */
export const STATUS_STYLES = {
  'Open': { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', label: 'Open' },
  'In Progress': { bg: '#fffbeb', border: '#fde68a', text: '#b45309', label: 'In Progress' },
  'Resolved': { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', label: 'Resolved' },
  'Closed': { bg: '#f8fafc', border: '#e2e8f0', text: '#475569', label: 'Closed' },
};

/**
 * Generate the HTML string for the ticket status update email.
 *
 * @param {object} params
 * @param {string} params.toName   - Customer's name
 * @param {string} params.ticketId - UUID of ticket
 * @param {string} params.subject  - Ticket subject
 * @param {string} params.status   - Ticket status
 * @param {string} params.appUrl   - Frontend base URL
 * @returns {string} Fully formatted HTML email body
 */
export const generateTicketStatusEmailHtml = ({
  toName,
  ticketId,
  subject,
  status,
  appUrl,
}) => {
  const statusStyle = STATUS_STYLES[status] || { bg: '#f1f5f9', border: '#e2e8f0', text: '#334155', label: status };
  const ticketUrl = `${appUrl}/tickets/${ticketId}`;
  const shortId = ticketId.substring(0, 8).toUpperCase();

  const safeName = escapeHtml(toName);
  const safeSubject = escapeHtml(subject);
  const safeStatus = escapeHtml(statusStyle.label);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Ticket Status Update</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 48px 16px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="padding: 24px 32px; border-bottom: 1px solid #f1f5f9;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="font-size: 15px; font-weight: 700; color: #0f172a; letter-spacing: -0.2px;">ResolvedYan</span>
                          <span style="font-size: 13px; color: #64748b; margin-left: 6px;">Support</span>
                        </td>
                        <td align="right">
                          <span style="font-size: 12px; font-family: monospace; color: #64748b;">#${shortId}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 32px;">
                    <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 16px 0;">
                      Ticket status updated
                    </h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                      Hello ${safeName || 'there'}, your support request status has been changed to <strong style="color: #0f172a;">${safeStatus}</strong>.
                    </p>

                    <!-- Ticket Details Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-bottom: 28px;">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Subject</span>
                          <div style="font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 4px;">
                            ${safeSubject}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top: 1px solid #e2e8f0; padding-top: 12px;">
                          <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Current Status</span>
                          <div style="margin-top: 6px;">
                            <span style="display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; background-color: ${statusStyle.bg}; border: 1px solid ${statusStyle.border}; color: ${statusStyle.text};">
                              ${safeStatus}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <a href="${ticketUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; text-align: center;">
                            View Ticket
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px; border-top: 1px solid #f1f5f9; background-color: #fafafa;">
                    <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 0;">
                      This is an automated notification from ResolvedYan Customer Support regarding ticket #${shortId}.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};
