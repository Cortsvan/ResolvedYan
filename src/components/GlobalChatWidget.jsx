import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function GlobalChatWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();

  const [activeChatId, setActiveChatId] = useState(null);

  const activeRequests = [
    { id: 1, name: "Alice Smith", issue: "Billing question", time: "2m ago", unread: true },
    { id: 2, name: "Bob Johnson", issue: "Cannot login", time: "15m ago", unread: false },
    { id: 3, name: "Charlie Davis", issue: "Where is my refund?", time: "1h ago", unread: false },
  ];

  useEffect(() => {
    const handleOpenChat = () => setIsChatOpen(true);
    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, []);

  // Shared SVGs
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

  if (!isChatOpen) {
    return (
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center z-[100] ring-4 ring-blue-600/20"
      >
        <ChatIcon className="w-8 h-8" />
      </button>
    );
  }

  // Header Actions (Expand / Close)
  const HeaderActions = ({ light = false }) => (
    <div className="flex items-center gap-1 shrink-0">
      <button onClick={() => setIsExpanded(!isExpanded)} className={`${light ? 'text-blue-100 hover:text-white' : 'text-slate-300 hover:text-white'} p-1.5 transition-colors`}>
        <ExpandIcon />
      </button>
      <button onClick={() => setIsChatOpen(false)} className={`${light ? 'text-blue-100 hover:text-white' : 'text-slate-300 hover:text-white'} p-1 transition-colors`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  // ==========================================
  // CUSTOMER VIEW
  // ==========================================
  if (user?.role === 'customer') {
    return (
      <div className={`fixed z-[100] transition-all duration-300 flex flex-col bg-slate-50 ${isExpanded ? 'inset-0 w-full h-full' : 'bottom-6 right-6 w-80 h-[400px] shadow-2xl border border-slate-200 rounded-2xl overflow-hidden'}`}>
        <div className={`flex flex-col h-full bg-white ${isExpanded ? 'max-w-4xl mx-auto w-full border-x border-slate-200 shadow-2xl' : ''}`}>
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <ChatIcon />
              </div>
              <div>
                <h4 className="font-bold text-sm">AI Assistant</h4>
                <p className="text-xs text-blue-100">Ready to help</p>
              </div>
            </div>
            <HeaderActions light={true} />
          </div>
          
          <div className="flex-1 p-4 bg-slate-50 overflow-y-auto flex flex-col gap-3">
            <div className="self-start bg-slate-200 text-slate-800 p-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%] shadow-sm">
              Hi {user?.name || "there"}! How can I help you today?
            </div>
            <div className="self-start mt-1">
              <button 
                onClick={() => alert("Redirecting to a live staff member...")}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-full shadow-sm hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
              >
                <UserIcon /> Talk to agent
              </button>
            </div>
          </div>

          <div className="p-3 border-t border-slate-200 bg-white flex gap-2 shrink-0">
            <input type="text" placeholder="Type your message..." className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-2.5 text-sm transition-all outline-none" />
            <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Send</button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STAFF / ADMIN VIEW (Expanded Split Screen)
  // ==========================================
  if (isExpanded) {
    const activeUser = activeChatId ? activeRequests.find(r => r.id === activeChatId) : null;
    return (
      <div className="fixed inset-0 z-[100] flex bg-white overflow-hidden animate-fade-in">
        
        {/* Left Sidebar: Inbox Queue */}
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
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-200 bg-white">
            {activeRequests.map((req) => (
              <div 
                key={req.id} 
                onClick={() => setActiveChatId(req.id)}
                className={`p-4 cursor-pointer transition-colors relative border-l-4 ${activeChatId === req.id ? 'bg-blue-50 border-blue-600' : 'hover:bg-slate-50 border-transparent'}`}
              >
                {req.unread && <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                <div className="flex justify-between items-start mb-1 pr-4">
                  <h5 className={`text-sm ${req.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    {req.name}
                  </h5>
                  <span className="text-xs text-slate-400">{req.time}</span>
                </div>
                <p className={`text-sm ${req.unread ? 'text-slate-700' : 'text-slate-500'} truncate pr-4`}>
                  {req.issue}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Main Content: Active Chat */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="bg-blue-600 border-l border-blue-500 p-4 flex justify-between items-center shrink-0 h-[72px] text-white">
            {activeUser ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold text-white">
                  {activeUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{activeUser.name}</h4>
                  <p className="text-xs text-blue-100">{activeUser.issue}</p>
                </div>
              </div>
            ) : (
              <div></div>
            )}
            
            <HeaderActions light={true} />
          </div>
          
          {activeUser ? (
            <>
              <div className="flex-1 p-6 bg-slate-50 overflow-y-auto flex flex-col gap-4">
                <div className="text-xs text-center text-slate-400 font-medium my-4">{activeUser.time}</div>
                <div className="self-start bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl rounded-tl-sm text-sm max-w-[70%] shadow-sm leading-relaxed">
                  I need help with my account. Can someone assist me?
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-white flex gap-3 shrink-0 items-center">
                <input type="text" placeholder={`Message ${activeUser.name}...`} className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl px-4 py-3 text-sm transition-all outline-none" />
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">Send</button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400 flex-col">
              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
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

  // ==========================================
  // STAFF / ADMIN VIEW (Collapsed Widget)
  // ==========================================
  const activeUser = activeChatId ? activeRequests.find(r => r.id === activeChatId) : null;
  
  if (activeChatId && activeUser) {
    return (
      <div className="fixed bottom-6 right-6 w-80 h-[450px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100] flex flex-col transition-all duration-300">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveChatId(null)} className="text-blue-100 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h4 className="font-bold text-sm truncate w-32">{activeUser.name}</h4>
            </div>
          </div>
          <HeaderActions light={true} />
        </div>
        
        <div className="flex-1 p-4 bg-slate-50 overflow-y-auto flex flex-col gap-3">
          <div className="self-start bg-slate-200 text-slate-800 p-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%] shadow-sm">
            I need help with my account. Can someone assist me?
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 bg-white flex gap-2 shrink-0">
          <input type="text" placeholder="Reply..." className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2 text-sm transition-all outline-none" />
          <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Send</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100] flex flex-col transition-all duration-300">
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <InboxIcon />
          </div>
          <div>
            <h4 className="font-bold text-sm">Live Support</h4>
            <p className="text-xs text-blue-100">{activeRequests.length} waiting</p>
          </div>
        </div>
        <HeaderActions light={true} />
      </div>
      
      <div className="flex-1 bg-slate-50 overflow-y-auto divide-y divide-slate-100">
        {activeRequests.map((req) => (
          <div 
            key={req.id} 
            onClick={() => setActiveChatId(req.id)}
            className="p-4 hover:bg-blue-50 cursor-pointer transition-colors relative"
          >
            {req.unread && <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
            <div className="flex justify-between items-start mb-1 pr-4">
              <h5 className={`text-sm ${req.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                {req.name}
              </h5>
              <span className="text-xs text-slate-400">{req.time}</span>
            </div>
            <p className={`text-sm ${req.unread ? 'text-slate-700' : 'text-slate-500'} truncate`}>
              {req.issue}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GlobalChatWidget;
