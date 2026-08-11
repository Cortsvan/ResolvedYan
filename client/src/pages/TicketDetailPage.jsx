import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchWithAuth } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import CategoryBadge from "../components/CategoryBadge";

function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    fetchTicketData();

    // Subscribe to both the ticket itself (for status updates) and ticket messages (for new chat replies)
    const ticketSubscription = supabase
      .channel(`ticket_${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `id=eq.${id}` }, () => {
        fetchTicketData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${id}` }, () => {
        fetchTicketData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ticketSubscription);
    };
  }, [id]);

  const fetchTicketData = async () => {
    setLoading(true);
    try {
      // Fetch ticket and customer profile via API
      const ticketData = await fetchWithAuth(`/tickets/${id}`);
      
      const formattedTicket = {
        ...ticketData.data,
        customer: ticketData.data.profiles ? `${ticketData.data.profiles.first_name} ${ticketData.data.profiles.last_name}` : 'Unknown'
      };

      setTicket(formattedTicket);

      // Fetch comments via API
      const commentsData = await fetchWithAuth(`/tickets/${id}/messages`);

      const formattedComments = commentsData.data.map(c => ({
        ...c,
        author: c.profiles ? `${c.profiles.first_name} ${c.profiles.last_name}` : 'Unknown',
        role: c.profiles?.role === 'admin' || c.profiles?.role === 'staff' ? 'Agent' : 'Customer'
      }));

      setComments(formattedComments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsReplying(true);
    try {
      await fetchWithAuth(`/tickets/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          message: replyMessage,
          is_internal: false
        })
      });

      // If customer replies to a Resolved ticket, reopen it automatically
      if (ticket.status === 'Resolved' && user?.role === 'customer') {
        await fetchWithAuth(`/tickets/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'Open' })
        });
        setTicket(prev => ({ ...prev, status: 'Open' }));
      }

      setReplyMessage("");
      fetchTicketData();
    } catch (err) {
      alert("Failed to send reply: " + err.message);
    } finally {
      setIsReplying(false);
    }
  };

  const handleReopen = async () => {
    try {
      await fetchWithAuth(`/tickets/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Open' })
      });
      setTicket(prev => ({ ...prev, status: 'Open' }));
    } catch (err) {
      alert("Failed to reopen ticket: " + err.message);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await fetchWithAuth(`/tickets/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setTicket(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      return;
    }

    try {
      await fetchWithAuth(`/tickets/${id}`, {
        method: 'DELETE'
      });

      navigate('/tickets');
    } catch (err) {
      alert("Failed to delete ticket: " + err.message);
    }
  };

  function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-slate-500">Loading ticket details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !ticket) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-sm p-8 flat-card">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Ticket Not Found</h2>
            <p className="text-slate-500 text-sm mb-6">
              The ticket doesn't exist or you don't have access.
            </p>
            <Link
              to="/tickets"
              className="btn-primary px-5 py-2.5 shadow-lg shadow-blue-500/20"
            >
              ← Back to Tickets
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const timeline = [
    {
      icon: "🎫",
      text: "Ticket created",
      time: ticket.created_at,
      color: "bg-blue-100 text-blue-600",
    },
    ...(ticket.status === "In Progress" || ticket.status === "Resolved"
      ? [
        {
          icon: "👤",
          text: "Ticket updated",
          time: ticket.updated_at || ticket.created_at,
          color: "bg-yellow-100 text-yellow-600",
        },
      ]
      : []),
    ...(ticket.status === "Resolved" || ticket.status === "Closed"
      ? [
        {
          icon: "✅",
          text: "Ticket resolved",
          time: ticket.updated_at || ticket.created_at,
          color: "bg-green-100 text-green-600",
        },
      ]
      : []),
  ];

  return (
    <DashboardLayout>
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/tickets" className="hover:text-blue-600 transition-colors">
          Tickets
        </Link>
        <span>›</span>
        <span className="font-mono text-blue-600 font-semibold">{String(ticket.id).substring(0, 8)}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
              {String(ticket.id).substring(0, 8)}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{ticket.subject}</h1>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <button
              onClick={handleDelete}
              className="btn-secondary flex-shrink-0 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
            >
              🗑️ Delete
            </button>
          )}
          <Link
            to="/tickets/new"
            className="btn-primary flex-shrink-0 px-4 py-2 shadow-sm"
          >
            + New Ticket
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="flat-card p-6">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-lg">📝</span> Description
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          <div className="flat-card p-6">
            <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span className="text-lg">📋</span>
              Ticket Thread
              {comments.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {comments.length}
                </span>
              )}
            </h2>

            {comments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-sm">No replies yet.</p>
                <p className="text-xs mt-1">
                  An agent will respond soon.
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-4 border-b border-slate-100 last:border-0 pb-5 last:pb-0"
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${comment.role === "Agent"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                        }`}
                    >
                      {comment.author.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-slate-900">
                          {comment.author}
                        </span>
                        {comment.role === "Agent" && (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-xs font-semibold">
                            Staff
                          </span>
                        )}
                        <span className="text-xs text-slate-400 ml-auto">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {comment.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-100">
              {ticket.status === 'Closed' ? (
                // CLOSED: hard archive — no one can reply
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-2xl">🔒</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">This ticket is archived</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {user?.role === 'customer'
                          ? 'This ticket has been closed. If the issue persists, please submit a new ticket.'
                          : 'This ticket is archived. You can reopen it if needed.'}
                      </p>
                    </div>
                    {/* Reopen button — only for admin/staff */}
                    {(user?.role === 'admin' || user?.role === 'staff') && (
                      <button
                        onClick={handleReopen}
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        ↩ Reopen
                      </button>
                    )}
                  </div>
                </div>
              ) : ticket.status === 'Resolved' && user?.role === 'customer' ? (
                // RESOLVED + CUSTOMER: soft close — customer can still reply (auto-reopens ticket)
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-3">
                    <span className="text-lg">✅</span>
                    <p className="text-xs text-emerald-700 font-medium">
                      This ticket has been marked as resolved. Reply below if the issue persists — it will automatically reopen.
                    </p>
                  </div>
                  <form onSubmit={handleReply}>
                    <textarea
                      rows="3"
                      className="input-field resize-y mb-3"
                      placeholder="Still having issues? Let us know and we'll reopen your ticket..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      required
                    ></textarea>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isReplying}
                        className="btn-primary px-5 py-2.5 shadow-sm disabled:opacity-50"
                      >
                        {isReplying ? "Sending..." : "Reply & Reopen"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // OPEN / IN PROGRESS: normal reply form
                <form onSubmit={handleReply}>
                  <textarea
                    rows="3"
                    className="input-field resize-y mb-3"
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    required
                  ></textarea>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isReplying}
                      className="btn-primary px-5 py-2.5 shadow-sm disabled:opacity-50"
                    >
                      {isReplying ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>

        <div className="space-y-5">
          <div className="flat-card p-5">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>📋</span> Ticket Info
            </h2>

            <div className="space-y-3">
              {[
                { label: "Ticket ID", value: String(ticket.id).substring(0, 8), mono: true },
                { label: "Customer", value: ticket.customer },
                {
                  label: "Created",
                  value: formatDate(ticket.created_at),
                },
                {
                  label: "Updated",
                  value: formatDate(ticket.updated_at || ticket.created_at),
                },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-start gap-3">
                  <span className="text-xs text-slate-400 flex-shrink-0">{row.label}</span>
                  <span
                    className={`text-xs font-medium text-slate-700 text-right ${row.mono ? "font-mono text-blue-600" : ""
                      }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}

              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-slate-400">Category</span>
                <CategoryBadge category={ticket.category} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Status</span>
                {(user?.role === 'admin' || user?.role === 'staff') ? (
                  <select
                    value={ticket.status}
                    onChange={handleStatusChange}
                    className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-semibold"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                ) : (
                  <StatusBadge status={ticket.status} />
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Priority</span>
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>
          </div>

          <div className="flat-card p-5">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>⏱️</span> Timeline
            </h2>

            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${event.color}`}>
                    {event.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {event.text}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(event.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default TicketDetailPage;
