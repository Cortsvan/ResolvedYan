import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { fetchWithAuth } from "../lib/api";

function GlobalChatWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();

  // Agent State
  const [activeRequests, setActiveRequests] = useState([]);
  const [archivedRequests, setArchivedRequests] = useState([]);
  const [activeStaffTab, setActiveStaffTab] = useState('active'); // 'active' | 'archive'
  const [activeChatId, setActiveChatId] = useState(null);
  const [agentMessages, setAgentMessages] = useState([]);
  const [agentInput, setAgentInput] = useState("");

  // Customer State
  const [customerLiveChat, setCustomerLiveChat] = useState(null);
  const [customerArchivedChats, setCustomerArchivedChats] = useState([]);
  const [activeCustomerTab, setActiveCustomerTab] = useState('active'); // 'active' | 'archive'
  const [customerMessages, setCustomerMessages] = useState([]);
  const [customerInput, setCustomerInput] = useState("");
  const [existingTickets, setExistingTickets] = useState([]);
  const [selectedFollowUpTicketId, setSelectedFollowUpTicketId] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const messagesEndRefCustomer = useRef(null);
  const messagesEndRefAgent = useRef(null);

  const scrollToBottomCustomer = () => messagesEndRefCustomer.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToBottomAgent = () => messagesEndRefAgent.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    const handleOpenChat = () => setIsChatOpen(true);
    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'customer') {
      fetchCustomerState();
      fetchCustomerExistingTickets();
      fetchCustomerArchivedChats();
    } else if (user.role === 'staff' || user.role === 'admin') {
      fetchAgentQueue();
      fetchAgentArchivedQueue();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('global-chat-channel');

    if (user.role === 'customer') {
      if (customerLiveChat) {
        channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tickets', filter: `id=eq.${customerLiveChat.id}` }, (payload) => {
          if (payload.new.status === 'Resolved' || payload.new.status === 'Closed') {
            setCustomerLiveChat({ ...customerLiveChat, status: 'Resolved' });
            fetchCustomerArchivedChats();
          }
        });
        channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${customerLiveChat.id}` }, () => {
          fetchCustomerMessages(customerLiveChat.id);
        });
      }
    } else if (user.role === 'staff' || user.role === 'admin') {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `category=eq.Live Chat` }, () => {
        fetchAgentQueue();
        fetchAgentArchivedQueue();
      });
      if (activeChatId) {
        channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${activeChatId}` }, () => {
          fetchAgentMessages(activeChatId);
        });
      }
    }

    channel.subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, customerLiveChat?.id, activeChatId]);

  useEffect(() => { scrollToBottomCustomer(); }, [customerMessages]);
  useEffect(() => { scrollToBottomAgent(); }, [agentMessages]);

  const fetchCustomerState = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .eq('customer_id', user.id)
      .eq('category', 'Live Chat')
      .in('status', ['Open', 'In Progress'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setCustomerLiveChat(data[0]);
      fetchCustomerMessages(data[0].id);
    } else {
      setCustomerLiveChat(null);
    }
  };

  const fetchCustomerExistingTickets = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('id, subject')
      .eq('customer_id', user.id)
      .in('status', ['Open', 'In Progress'])
      .neq('category', 'Live Chat')
      .order('created_at', { ascending: false });
    if (data) setExistingTickets(data);
  };

  const fetchCustomerArchivedChats = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .eq('customer_id', user.id)
      .eq('category', 'Live Chat')
      .in('status', ['Resolved', 'Closed'])
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setCustomerArchivedChats(data);
  };

  const fetchCustomerMessages = async (ticketId) => {
    const { data } = await supabase
      .from('ticket_messages')
      .select('*, profiles:user_id(first_name, last_name, role, avatar_url)')
      .eq('ticket_id', ticketId)
      .eq('is_internal', false)
      .order('created_at', { ascending: true });
    if (data) setCustomerMessages(data);
  };

  const [isStartingChat, setIsStartingChat] = useState(false);

  const startLiveChat = async () => {
    if (isStartingChat) return; // prevent duplicate calls
    setIsStartingChat(true);

    let subject = "Live Support Request";
    let autoMessage = null;
    if (selectedFollowUpTicketId) {
      const selected = existingTickets.find(t => t.id === selectedFollowUpTicketId);
      if (selected) {
        subject = `Live Chat (Follow-up: ${selected.subject})`;
        autoMessage = `I am following up on my ticket #${selected.id}: "${selected.subject}".`;
      }
    }

    try {
      const { data } = await fetchWithAuth('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject,
          category: 'Live Chat',
          description: 'Customer requested live chat support.'
        })
      });

      if (data) {
        setCustomerLiveChat(data);
        setCustomerMessages([]);

        if (autoMessage) {
          await fetchWithAuth(`/tickets/${data.id}/messages`, {
            method: 'POST',
            body: JSON.stringify({
              message: autoMessage,
              is_internal: false
            })
          });
        }
      }
    } catch (error) {
      console.error("Failed to start live chat:", error);
    } finally {
      setIsStartingChat(false);
    }
  };

  const endLiveChat = async () => {
    if (!customerLiveChat || isResolving) return;
    setIsResolving(true);
    try {
      await fetchWithAuth(`/customers/live-chat/${customerLiveChat.id}/resolve`, { method: 'POST' });
      setCustomerLiveChat({ ...customerLiveChat, status: 'Resolved' });
    } catch (error) {
      console.error("Error resolving chat:", error);
      alert("Failed to close chat. Please try again or check permissions.");
    } finally {
      setIsResolving(false);
    }
  };

  const loadCustomerArchivedChat = (chat) => {
    setCustomerLiveChat(chat);
    fetchCustomerMessages(chat.id);
  };

  const sendCustomerMessage = async (e) => {
    if (e) e.preventDefault();
    if (!customerInput.trim() || !customerLiveChat) return;

    const msg = customerInput;
    setCustomerInput("");
    
    try {
      await fetchWithAuth(`/tickets/${customerLiveChat.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          message: msg,
          is_internal: false
        })
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const deleteArchivedChat = async (e, chatId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation forever?")) return;

    try {
      await fetchWithAuth(`/tickets/${chatId}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Failed to delete chat:", error);
      alert("Failed to delete chat. You might not have permission.");
      return;
    }

    if (user?.role === 'customer') {
      fetchCustomerArchivedChats();
      if (customerLiveChat?.id === chatId) {
        setCustomerLiveChat(null);
        setCustomerMessages([]);
      }
    } else {
      fetchAgentArchivedQueue();
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setAgentMessages([]);
      }
    }
  };

  const fetchAgentQueue = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*, profiles:customer_id(first_name, last_name)')
      .eq('category', 'Live Chat')
      .in('status', ['Open', 'In Progress'])
      .order('created_at', { ascending: false });
    if (data) setActiveRequests(data);
  };

  const fetchAgentArchivedQueue = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*, profiles:customer_id(first_name, last_name)')
      .eq('category', 'Live Chat')
      .in('status', ['Resolved', 'Closed'])
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setArchivedRequests(data);
  };

  const fetchAgentMessages = async (ticketId) => {
    const { data } = await supabase
      .from('ticket_messages')
      .select('*, profiles:user_id(first_name, last_name, role, avatar_url)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    if (data) setAgentMessages(data);
  };

  const selectAgentChat = (req) => {
    setActiveChatId(req.id);
    fetchAgentMessages(req.id);
    if (req.status === 'Open') {
      fetchWithAuth(`/tickets/${req.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'In Progress' })
      }).then(() => fetchAgentQueue()).catch(console.error);
    }
  };

  const sendAgentMessage = async (e) => {
    if (e) e.preventDefault();
    if (!agentInput.trim() || !activeChatId) return;

    const msg = agentInput;
    setAgentInput("");
    try {
      await fetchWithAuth(`/tickets/${activeChatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          message: msg,
          is_internal: false
        })
      });
    } catch (error) {
      console.error("Failed to send agent message:", error);
    }
  };

  const resolveAgentChat = async () => {
    if (!activeChatId || isResolving) return;
    setIsResolving(true);
    try {
      await fetchWithAuth(`/customers/live-chat/${activeChatId}/resolve`, { method: 'POST' });
      fetchAgentQueue();
      fetchAgentArchivedQueue();
      setActiveChatId(null);
    } catch (error) {
      console.error("Error resolving agent chat:", error);
      alert("Failed to resolve chat.");
    } finally {
      setIsResolving(false);
    }
  };

  const ExpandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      {isExpanded ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      )}
    </svg>
  );

  const ChatIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );

  const InboxIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021 18v-4.162c0-.226-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  );

  const UserIcon = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
  );

  const HeaderActions = ({ light = false }) => (
    <div className="flex items-center shrink-0">
      <button onClick={() => setIsExpanded(!isExpanded)} className={`${light ? 'text-blue-100 hover:text-white' : 'text-slate-300 hover:text-white'} p-1.5 transition-colors shrink-0`}>
        <ExpandIcon />
      </button>
      <button onClick={() => setIsChatOpen(false)} className={`${light ? 'text-blue-100 hover:text-white' : 'text-slate-300 hover:text-white'} p-1 transition-colors shrink-0`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  const renderMessageList = (messages, currentUserId) => {
    return messages.map((msg, index) => {
      const isMe = msg.user_id === currentUserId;
      const showTimestamp = index === messages.length - 1 || messages[index + 1].user_id !== msg.user_id;

      let isSenderAgent = false;
      if (msg.profiles?.role === 'staff' || msg.profiles?.role === 'admin') {
        isSenderAgent = true;
      } else if (user?.role === 'customer' && !isMe) {
        isSenderAgent = true;
      } else if ((user?.role === 'staff' || user?.role === 'admin') && isMe) {
        isSenderAgent = true;
      }

      const isSystemMessage = msg.message?.startsWith('System: ');
      let senderName = 'Customer';
      
      if (isSystemMessage) {
        senderName = 'System';
      } else if (isSenderAgent) {
        senderName = 'Agent';
      } else if (msg.profiles?.first_name) {
        senderName = `${msg.profiles.first_name} ${msg.profiles.last_name || ''}`.trim();
      }

      const avatarUrl = isSystemMessage
        ? `https://api.dicebear.com/7.x/initials/svg?seed=Sys&backgroundColor=64748b`
        : isSenderAgent
        ? `https://api.dicebear.com/7.x/initials/svg?seed=Agent&backgroundColor=2563eb`
        : (msg.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${senderName}&backgroundColor=2563eb`);

      return (
        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full ${!showTimestamp ? 'mb-1' : 'mb-3'}`}>
          {!isMe && showTimestamp && (
            <img src={avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover mr-2 self-end mb-4 shadow-sm border border-slate-200" />
          )}
          {!isMe && !showTimestamp && (
            <div className="w-7 mr-2 shrink-0"></div>
          )}

          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
            <div className={`px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-2xl rounded-tr-[4px]' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-[4px]'}`}>
              {msg.message}
            </div>
            {showTimestamp && (
              <span className={`text-[10px] text-slate-400 mt-1 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                {isMe ? "You" : senderName} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      );
    });
  };

  if (!user) return null;

  if (!isChatOpen) {
    return (
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center z-[100] ring-4 ring-blue-600/20">
        <ChatIcon className="w-8 h-8" />
      </button>
    );
  }

  // ==========================================
  // CUSTOMER VIEW
  // ==========================================
  if (user?.role === 'customer') {
    const isLocked = customerLiveChat?.status === 'Resolved' || customerLiveChat?.status === 'Closed';
    const agentName = 'Agent';
    const agentAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=Agent&backgroundColor=3b82f6`;

    return (
      <div className={`fixed z-[100] transition-all duration-300 flex bg-slate-50 ${isExpanded ? 'inset-0 w-full h-full animate-fade-in' : 'bottom-6 right-6 w-80 h-[450px] shadow-2xl border border-slate-200 rounded-2xl overflow-hidden flex-col'}`}>

        {/* SIDEBAR - Only visible when expanded */}
        {isExpanded && (
          <div className="w-80 md:w-96 flex flex-col border-r border-slate-200 bg-slate-50 shrink-0">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0 h-[72px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <ChatIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Live Support</h4>
                  <p className="text-xs text-blue-100">Messages</p>
                </div>
              </div>
            </div>
            <div className="flex border-b border-slate-200 bg-white">
              <button
                onClick={() => setActiveCustomerTab('active')}
                className={`flex-1 py-2.5 text-[13px] font-semibold transition-colors ${activeCustomerTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveCustomerTab('archive')}
                className={`flex-1 py-2.5 text-[13px] font-semibold transition-colors ${activeCustomerTab === 'archive' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Archive
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200 bg-white">
              {activeCustomerTab === 'active' ? (
                <>
                  {customerLiveChat && !isLocked && (
                    <div onClick={() => { }} className={`p-4 cursor-pointer bg-blue-50 border-l-4 border-blue-600`}>
                      <div className="flex justify-between items-start mb-1 pr-4">
                        <h5 className="text-sm font-semibold text-slate-700">{agentName}</h5>
                        <span className="text-[11px] text-blue-600 font-medium">Active</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate pr-4">{customerLiveChat.subject}</p>
                    </div>
                  )}
                  {(!customerLiveChat || isLocked) && (
                    <p className="p-6 text-sm text-center text-slate-500">No active chat.</p>
                  )}
                </>
              ) : (
                <>
                  {customerArchivedChats.length === 0 && (
                    <p className="p-6 text-sm text-center text-slate-500">No past conversations.</p>
                  )}
                  {customerArchivedChats.map(chat => (
                    <div key={chat.id} onClick={() => loadCustomerArchivedChat(chat)} className={`p-4 cursor-pointer hover:bg-slate-50 border-l-4 transition-colors ${customerLiveChat?.id === chat.id ? 'bg-slate-100 border-slate-400' : 'border-transparent'}`}>
                      <div className="flex justify-between items-start mb-1 pr-4 relative">
                        <h5 className="text-sm font-semibold text-slate-700 truncate pr-6">{chat.subject}</h5>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-[11px] text-slate-400 mb-1">{new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 truncate pr-4">{new Date(chat.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* MAIN CHAT AREA */}
        <div className={`flex flex-col h-full w-full bg-slate-50 ${isExpanded ? 'flex-1' : ''}`}>
          <div className={`bg-blue-600 p-4 text-white flex justify-between items-center shrink-0 shadow-sm z-10 border-b border-white/10 ${isExpanded ? 'h-[72px] border-l border-white/10' : ''}`}>
            {customerLiveChat ? (
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <img src={agentAvatarUrl} alt={agentName} className="w-10 h-10 shrink-0 rounded-full object-cover shadow-inner border border-white/20 bg-white/20" />
                <div className="min-w-0">
                  <h4 className="font-bold text-[15px] drop-shadow-sm truncate">{agentName}</h4>
                  <p className="text-xs text-blue-100/90 font-medium truncate">{isLocked ? 'Conversation closed' : 'Live Support Agent'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-10 h-10 shrink-0 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
                  <ChatIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-[15px] drop-shadow-sm truncate">Live Support</h4>
                  <p className="text-xs text-blue-100/90 font-medium truncate">Ready to help</p>
                </div>
              </div>
            )}
            <div className="flex items-center shrink-0 gap-2">
              {customerLiveChat && !isLocked && (
                <button onClick={endLiveChat} disabled={isResolving} className="bg-red-500 disabled:opacity-50 hover:bg-red-600 shadow-sm text-white text-xs font-semibold px-4 py-2 rounded-full transition-all border border-red-400/50 flex items-center gap-1 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" /></svg>
                  {isResolving ? 'Ending...' : 'End Chat'}
                </button>
              )}
              {isLocked && (
                <button onClick={() => setCustomerLiveChat(null)} className="bg-blue-500 hover:bg-blue-600 shadow-sm text-white text-xs font-semibold px-4 py-2 rounded-full transition-all border border-blue-400/50 flex items-center shrink-0">
                  New Chat
                </button>
              )}
              <HeaderActions light={true} />
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto flex flex-col gap-3 ${isExpanded ? 'p-6 w-full' : 'p-4'}`}>
            {!customerLiveChat ? (
              <div className="flex flex-col items-center h-full text-center px-4 overflow-y-auto pt-6 pb-2">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shrink-0">
                  <UserIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Need Help?</h3>
                <p className="text-sm text-slate-500 mb-6">Start a live chat with one of our support agents.</p>

                {existingTickets.length > 0 && (
                  <div className="w-full mb-4 text-left">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Follow up on an existing ticket? (Optional)</label>
                    <select
                      className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={selectedFollowUpTicketId}
                      onChange={(e) => setSelectedFollowUpTicketId(e.target.value)}
                    >
                      <option value="">-- Start a new request --</option>
                      {existingTickets.map(t => (
                        <option key={t.id} value={t.id}>{t.subject}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={startLiveChat}
                  disabled={isStartingChat}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-8 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ChatIcon className="w-5 h-5" /> {isStartingChat ? "Starting..." : "Start Live Chat"}
                </button>

                {!isExpanded && customerArchivedChats.length > 0 && (
                  <div className="w-full text-left mt-auto">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Past Conversations</h4>
                    <div className="flex flex-col gap-2">
                      {customerArchivedChats.map(chat => (
                        <div key={chat.id} onClick={() => loadCustomerArchivedChat(chat)} className="p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors shadow-sm relative group">
                          <h5 className="font-semibold text-slate-700 text-[13px] truncate pr-6">{chat.subject}</h5>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-[11px] text-slate-500">{new Date(chat.created_at).toLocaleDateString()}</p>
                            {user?.role !== 'customer' && (
                              <button onClick={(e) => deleteArchivedChat(e, chat.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Delete conversation">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" /></svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="text-xs text-center text-slate-400 my-2">Chat started</div>
                {renderMessageList(customerMessages, user.id)}
                <div ref={messagesEndRefCustomer} />
              </>
            )}
          </div>

          {customerLiveChat && (
            <div className="p-3 border-t border-slate-200 bg-white flex shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] w-full">
              <div className={`w-full ${isExpanded ? 'px-4' : ''}`}>
                {isLocked ? (
                  <div className="w-full text-center text-slate-500 text-sm py-2">
                    This conversation has been closed.
                  </div>
                ) : (
                  <form onSubmit={sendCustomerMessage} className="flex gap-2 items-center w-full">
                    <input
                      type="text"
                      value={customerInput}
                      onChange={(e) => setCustomerInput(e.target.value)}
                      placeholder="Type your message..."
                      maxLength={2000}
                      className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-full px-4 py-2.5 text-[14px] transition-all outline-none"
                    />
                    <button type="submit" disabled={!customerInput.trim()} className="bg-blue-600 disabled:bg-slate-300 text-white p-2.5 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm w-10 h-10 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-px translate-y-px"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // STAFF / ADMIN VIEW 
  // ==========================================
  if (user?.role === 'staff' || user?.role === 'admin') {
    const activeUser = activeChatId
      ? (activeRequests.find(r => r.id === activeChatId) || archivedRequests.find(r => r.id === activeChatId))
      : null;
    const isAgentLocked = activeUser?.status === 'Resolved' || activeUser?.status === 'Closed';

    if (isExpanded) {
      return (
        <div className="fixed inset-0 z-[100] flex bg-white overflow-hidden animate-fade-in">
          {/* Left Sidebar */}
          <div className="w-80 md:w-96 flex flex-col border-r border-slate-200 bg-slate-50 shrink-0">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0 h-[72px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <InboxIcon />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Live Support Queue</h4>
                  <p className="text-xs text-blue-100">{activeRequests.length} waiting</p>
                </div>
              </div>
            </div>
            <div className="flex border-b border-slate-200 bg-white">
              <button
                onClick={() => setActiveStaffTab('active')}
                className={`flex-1 py-2.5 text-[13px] font-semibold transition-colors ${activeStaffTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Active ({activeRequests.length})
              </button>
              <button
                onClick={() => setActiveStaffTab('archive')}
                className={`flex-1 py-2.5 text-[13px] font-semibold transition-colors ${activeStaffTab === 'archive' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Archive
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200 bg-white">
              {(activeStaffTab === 'active' ? activeRequests : archivedRequests).map((req) => (
                <div key={req.id} onClick={() => selectAgentChat(req)} className={`p-4 cursor-pointer transition-colors relative border-l-4 ${activeChatId === req.id ? 'bg-blue-50 border-blue-600' : 'hover:bg-slate-50 border-transparent'}`}>
                  <div className="flex justify-between items-start mb-1 pr-4 relative">
                    <h5 className="text-sm font-semibold text-slate-700 pr-6 truncate">{req.profiles ? `${req.profiles.first_name} ${req.profiles.last_name}` : "Customer"}</h5>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[11px] text-slate-400 mb-1">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button onClick={(e) => deleteArchivedChat(e, req.id)} className="text-slate-300 hover:text-red-500 transition-colors" title="Delete conversation">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 truncate pr-4">{req.subject}</p>
                </div>
              ))}
              {(activeStaffTab === 'active' ? activeRequests : archivedRequests).length === 0 && (
                <p className="p-6 text-sm text-center text-slate-500">No {activeStaffTab} chats.</p>
              )}
            </div>
          </div>

          {/* Right Main Content */}
          <div className="flex-1 flex flex-col bg-slate-50">
            <div className="bg-blue-600 p-4 flex justify-between items-center shrink-0 h-[72px] text-white shadow-sm z-10 border-l border-white/10">
              {activeUser ? (
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-10 h-10 shrink-0 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold text-white uppercase shadow-inner">
                    {activeUser.profiles?.first_name?.charAt(0) || "C"}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[15px] drop-shadow-sm truncate">{activeUser.profiles?.first_name} {activeUser.profiles?.last_name}</h4>
                    <p className="text-xs text-blue-100/90 font-medium truncate">{activeUser.subject}</p>
                  </div>
                </div>
              ) : <div></div>}
              <div className="flex items-center shrink-0 gap-2">
                {activeUser && !isAgentLocked && (
                  <button onClick={resolveAgentChat} className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white text-xs font-semibold px-4 py-2 rounded-full transition-all border border-emerald-400/50 flex items-center gap-1 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
                    Resolve
                  </button>
                )}
                <HeaderActions light={true} />
              </div>
            </div>

            {activeUser ? (
              <>
                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                  {renderMessageList(agentMessages, user.id)}
                  <div ref={messagesEndRefAgent} />
                </div>
                {isAgentLocked ? (
                  <div className="w-full text-center text-slate-500 text-sm py-2">
                    This conversation has been closed.
                  </div>
                ) : (
                  <form onSubmit={sendAgentMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] items-center">
                    <input
                      type="text"
                      value={agentInput}
                      onChange={(e) => setAgentInput(e.target.value)}
                      placeholder="Reply to customer..."
                      maxLength={2000}
                      className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-full px-4 py-2.5 text-[14px] transition-all outline-none"
                    />
                    <button type="submit" disabled={!agentInput.trim()} className="bg-blue-600 disabled:bg-slate-300 text-white p-2.5 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm w-10 h-10 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-px translate-y-px"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 flex-col">
                <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <ChatIcon className="w-10 h-10" />
                </div>
                <p className="text-lg font-medium text-slate-600">Select a conversation</p>
                <p className="text-sm">Choose a customer from the queue to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Collapsed Widget for Agent
    return (
      <div className="fixed bottom-6 right-6 w-80 h-[450px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100] flex flex-col transition-all duration-300">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {activeChatId ? (
              <button onClick={() => setActiveChatId(null)} className="shrink-0 text-white hover:bg-white/20 p-1.5 rounded-full transition-colors border border-transparent hover:border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
            ) : (
              <div className="w-8 h-8 shrink-0 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
                <InboxIcon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h4 className="font-bold text-[15px] drop-shadow-sm truncate">{activeUser ? `${activeUser.profiles?.first_name} ${activeUser.profiles?.last_name}` : "Live Support"}</h4>
              {!activeChatId && <p className="text-xs text-blue-100/90 font-medium truncate">{activeRequests.length} waiting</p>}
            </div>
          </div>
          <div className="flex items-center shrink-0 gap-1">
            {activeChatId && !isAgentLocked && (
              <button onClick={resolveAgentChat} disabled={isResolving} className="bg-emerald-500 disabled:opacity-50 hover:bg-emerald-600 shadow-sm text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-full transition-all border border-emerald-400/50 flex items-center gap-1 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
                {isResolving ? 'Resolving...' : 'Resolve'}
              </button>
            )}
            <HeaderActions light={true} />
          </div>
        </div>

        {activeChatId ? (
          <>
            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto flex flex-col gap-3">
              {renderMessageList(agentMessages, user.id)}
              <div ref={messagesEndRefAgent} />
            </div>
            <form onSubmit={sendAgentMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] items-center">
              <input type="text" value={agentInput} onChange={(e) => setAgentInput(e.target.value)} maxLength={2000} placeholder="Reply..." className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-full px-4 py-2.5 text-[14px] transition-all outline-none" />
              <button type="submit" disabled={!agentInput.trim()} className="bg-blue-600 disabled:bg-slate-300 text-white p-2.5 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm w-10 h-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-px translate-y-px"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 bg-slate-50 overflow-y-auto divide-y divide-slate-100">
            {activeRequests.map((req) => (
              <div key={req.id} onClick={() => selectAgentChat(req)} className="p-4 hover:bg-blue-50 cursor-pointer transition-colors relative">
                <div className="flex justify-between items-start mb-1 pr-4">
                  <h5 className="text-sm font-semibold text-slate-700">{req.profiles ? `${req.profiles.first_name} ${req.profiles.last_name}` : "Customer"}</h5>
                  <span className="text-xs text-slate-400">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-slate-500 truncate">{req.subject}</p>
              </div>
            ))}
            {activeRequests.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <p className="text-sm">Queue is empty</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default GlobalChatWidget;
