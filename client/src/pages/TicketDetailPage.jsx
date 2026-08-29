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
      const ticketData = await fetchWithAuth(`/tickets/${id}`);
      
      const formattedTicket = {
        ...ticketData.data,
        customer: ticketData.data.profiles ? `${ticketData.data.profiles.first_name || ''} ${ticketData.data.profiles.last_name || ''}`.trim() || ticketData.data.profiles.email || 'Customer' : 'Customer',
        customerEmail: ticketData.data.profiles?.email || ''
      };

      setTicket(formattedTicket);

      const commentsData = await fetchWithAuth(`/tickets/${id}/messages`);

      const formattedComments = commentsData.data.map(c => ({
        ...c,
        author: c.profiles ? `${c.profiles.first_name || ''} ${c.profiles.last_name || ''}`.trim() || c.profiles.email || 'Agent' : 'Agent',
        role: c.profiles?.role === 'admin' || c.profiles?.role === 'staff' ? 'Staff' : 'Customer'
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

      navigate(user?.role === 'customer' ? '/tickets' : '/admin/tickets');
    } catch (err) {
      alert("Failed to delete ticket: " + err.message);
    }
  };

  function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-slate-500">Loading ticket details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !ticket) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-sm p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Ticket Not Found</h2>
            <p className="text-slate-500 text-xs mb-6">
              The ticket does not exist or you don't have permission to view it.
            </p>
            <Link
              to={user?.role === 'customer' ? "/tickets" : "/admin/tickets"}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              ← Return to Ticket List
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
              <Link to={user?.role === 'customer' ? "/tickets" : "/admin/tickets"} className="hover:text-blue-600 transition-colors">
                Tickets
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-mono">#{String(ticket.id).substring(0, 8)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200" title={ticket.id}>
                #{String(ticket.id).substring(0, 8)}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {ticket.subject}
              </h1>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {user?.role === 'admin' && (
              <button
                onClick={handleDelete}
                className="px-3.5 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete Ticket
              </button>
            )}
            <Link
              to="/tickets/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Ticket
            </Link>
          </div>
        </div>

        {/* 2 Column Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Discussion Thread Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">Request Description</h2>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap pl-10">
                {ticket.description}
              </p>
            </div>

            {/* Conversation Thread Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Conversation History</h2>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {comments.length} Replies
                </span>
              </div>

              {comments.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-sm font-medium">No replies posted yet.</p>
                  <p className="text-xs mt-1">A support specialist will follow up shortly.</p>
                </div>
              ) : (
                <div className="space-y-6 mb-8">
                  {comments.map((comment) => {
                    const isStaff = comment.role === "Staff";
                    return (
                      <div key={comment.id} className="flex gap-3.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isStaff ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {comment.author.charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900 text-xs">{comment.author}</span>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                              isStaff ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                              {comment.role}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-auto font-medium">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                            {comment.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Reply Form */}
              <div className="pt-6 border-t border-slate-100">
                {ticket.status === 'Closed' ? (
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-slate-700">This ticket has been closed and archived</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Replies are disabled for closed tickets.</p>
                    </div>
                    {(user?.role === 'admin' || user?.role === 'staff') && (
                      <button
                        onClick={handleReopen}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-xs"
                      >
                        Reopen Ticket
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleReply} className="space-y-3">
                    <textarea
                      rows="3"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/40 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 resize-y"
                      placeholder="Type your response or update..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      required
                    ></textarea>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isReplying}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60"
                      >
                        {isReplying ? "Sending..." : "Send Response"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

          </div>

          {/* Ticket Metadata Sidebar */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </div>
                <h3 className="font-bold text-sm text-slate-900">Ticket Information</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Ticket ID</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200" title={ticket.id}>
                    #{String(ticket.id).substring(0, 8)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Customer</span>
                  <span className="font-bold text-slate-900">{ticket.customer}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Category</span>
                  <CategoryBadge category={ticket.category} />
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Priority</span>
                  <PriorityBadge priority={ticket.priority} />
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Status</span>
                  {(user?.role === 'admin' || user?.role === 'staff') ? (
                    <select
                      value={ticket.status}
                      onChange={handleStatusChange}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                        ticket.status === 'Open'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : ticket.status === 'In Progress'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : ticket.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
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

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Created</span>
                  <span className="text-slate-700 font-medium">{formatDate(ticket.created_at)}</span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-400 font-medium">Last Activity</span>
                  <span className="text-slate-700 font-medium">{formatDate(ticket.updated_at || ticket.created_at)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default TicketDetailPage;
