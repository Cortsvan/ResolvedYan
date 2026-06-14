import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import resolvedYanLogo from "../assets/ResolvedYan Logo.png";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

// ============================================================
// FEATURES DATA (Customer-Facing)
// ============================================================
const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    color: "bg-blue-100 text-blue-600",
    title: "Instant Live Chat",
    description: "Get answers right away by chatting with available support agents in real-time.",
    tag: "Fastest response",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    color: "bg-blue-100 text-blue-600",
    title: "Secure Ticket Tracking",
    description: "Submit a detailed request and track its progress from open to resolved in a personal dashboard.",
    tag: "Track anytime",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-blue-100 text-blue-600",
    title: "24/7 Availability",
    description: "The portal is highly available, allowing ticket submissions at any time of the day with continuous monitoring.",
    tag: "Always on",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    color: "bg-indigo-100 text-indigo-600",
    title: "Smart Ticket Categorization",
    description: "An upcoming AI feature will automatically categorize, prioritize, and route your tickets to the right agent instantly.",
    tag: "Coming Soon ✨",
    isHighlighted: true,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-blue-100 text-blue-600",
    title: "Expert Resolution",
    description: "Requests are automatically routed to the team member best equipped to solve the specific problem.",
    tag: "Expert support",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    color: "bg-blue-100 text-blue-600",
    title: "Privacy First",
    description: "Data security is built-in. Information is encrypted and strictly accessible only to authorized personnel.",
    tag: "Highly secure",
  },
];

// ============================================================
// PROCESS STEPS
// ============================================================
const steps = [
  {
    number: "01",
    icon: "✏️",
    title: "Submit a Request",
    description: "Users log in and describe the issue they are facing through a simple ticket creation form.",
  },
  {
    number: "02",
    icon: "🚀",
    title: "Ticket Assignment",
    description: "The ticket is immediately assigned to the appropriate staff or admin for review.",
  },
  {
    number: "03",
    icon: "💬",
    title: "Communication",
    description: "Agents and customers chat live or reply to updates directly from the dashboard.",
  },
  {
    number: "04",
    icon: "✅",
    title: "Issue Resolved",
    description: "Tickets are tracked through resolution until the problem is completely solved.",
  },
];

// ============================================================
// DASHBOARD PREVIEW MOCKUP COMPONENT
// ============================================================
function DashboardMockup() {
  const mockTickets = [
    { id: "TKT-001", subject: "How do I upgrade my account?", priority: "High", status: "Resolved", time: "2m ago" },
    { id: "TKT-002", subject: "I forgot my password", priority: "Medium", status: "In Progress", time: "8m ago" },
    { id: "TKT-003", subject: "Feature request: Dark mode", priority: "Low", status: "Open", time: "1h ago" },
    { id: "TKT-004", subject: "Billing question regarding recent invoice", priority: "High", status: "Open", time: "12m ago" },
  ];

  const priorityStyle = {
    High: "bg-orange-100 text-orange-700",
    Medium: "bg-blue-100 text-blue-700",
    Low: "bg-slate-100 text-slate-700",
  };
  const statusStyle = {
    Open: "bg-blue-100 text-blue-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    Resolved: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="mockup-shadow rounded-2xl overflow-hidden border border-slate-200 bg-white animate-float">
      {/* Window chrome bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        <div className="ml-3 flex-1 bg-white border border-slate-200 rounded h-5 flex items-center px-2">
          <span className="text-[10px] text-slate-400">support.yourcompany.com</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-40 border-r border-slate-100 bg-slate-50 p-3 hidden sm:block">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Portal</div>
          {[
            { icon: "🎫", label: "My Tickets", active: true },
            { icon: "✏️", label: "Submit Ticket", active: false },
            { icon: "👤", label: "Profile", active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 text-xs font-medium ${item.active
                ? "bg-blue-100 text-blue-700"
                : "text-slate-500"
                }`}
            >
              <span className="text-xs">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 min-w-0 bg-white">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-800">Welcome back, John!</h2>
            <p className="text-[10px] text-slate-500">Here are your recent support requests.</p>
          </div>

          {/* Tickets table */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-600">My Tickets</span>
              <span className="text-[9px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">+ New Ticket</span>
            </div>
            {mockTickets.map((ticket, i) => (
              <div
                key={ticket.id}
                className={`flex items-center gap-2 px-3 py-2 ${i < mockTickets.length - 1 ? "border-b border-slate-50" : ""
                  }`}
              >
                <span className="font-mono text-[9px] text-slate-400 hidden sm:block w-14 flex-shrink-0">
                  {ticket.id}
                </span>
                <span className="text-[10px] text-slate-700 font-medium flex-1 truncate">{ticket.subject}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${statusStyle[ticket.status] || ""}`}>
                  {ticket.status}
                </span>
                <span className="text-[9px] text-slate-400 hidden md:block flex-shrink-0">{ticket.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN HOMEPAGE COMPONENT
// ============================================================
function HomePage() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    if (user.role === 'admin' || user.role === 'staff') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ====================================================
          HERO SECTION
          ==================================================== */}
      <section className="hero-bg relative min-h-screen flex flex-col justify-center pt-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* ---- Left: Text Content ---- */}
            <div className="animate-fade-up">
              {/* Live badge */}
              <div className="badge-live mb-6 w-fit">
                <span className="dot" />
                Support is online
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-slate-900 mb-6">
                How can we
                <br />
                <span className="text-blue-600">help you today?</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-10 max-w-lg">
                Welcome to the customer support portal demo. Submit a ticket, test the live chat, or track the progress of your requests all in one place.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link to="/tickets/new" className="btn-primary text-center justify-center shadow-sm">
                  Submit a Ticket
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link to="/login" className="btn-secondary text-center justify-center">
                  Log In to Portal
                </Link>
              </div>
            </div>

            {/* ---- Right: Dashboard Preview ---- */}
            <div
              className="animate-fade-up hidden lg:block"
              style={{ animationDelay: "150ms", animationFillMode: "both" }}
            >
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          FEATURES SECTION
          ==================================================== */}
      <section className="py-24 bg-white border-b border-slate-200" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-label mx-auto w-fit mb-5">
              Support Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-5">
              Everything you need to{" "}
              <span className="text-blue-600">get answers fast</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
              We are dedicated to providing you with the best support experience possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`feature-card ${feature.isHighlighted ? 'ring-2 ring-indigo-500 shadow-md shadow-indigo-200' : ''}`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${feature.color}`}>
                  {feature.icon}
                </div>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3 ${feature.isHighlighted ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                  {feature.tag}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          HOW IT WORKS SECTION
          ==================================================== */}
      <section className="py-24 bg-slate-50 border-b border-slate-200" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-label mx-auto w-fit mb-5">
              Process
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-5">
              From issue to resolution{" "}
              <span className="text-blue-600">in 4 simple steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative group">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-1rem)] w-full h-[2px] bg-slate-200" />
                )}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold border border-blue-100">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          CTA SECTION
          ==================================================== */}
      <section className="py-24 bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="badge-live mx-auto w-fit mb-6">
              <span className="dot" />
              Build with me
            </div>
            <h2 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Need help with your business
              <br />
              <span className="text-blue-600">or have a project in mind?</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed font-medium">
              I'm always eager to learn, collaborate, and build software solutions that help solve real-world problems. Feel free to connect with me through any of the channels below.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:jovann.cortes@gmail.com" className="btn-primary text-center justify-center shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Email Me
              </a>
              <a href="https://www.linkedin.com/in/jovancortes/" target="_blank" rel="noopener noreferrer" className="btn-secondary text-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          FOOTER
          ==================================================== */}
      <footer className="bg-slate-50 text-slate-500 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-14">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <img src={resolvedYanLogo} alt="ResolvedYan" className="w-8 h-8 object-contain" />
                <span className="text-slate-900 font-bold text-sm">ResolvedYan</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs mb-5">
                AI-Powered Customer Support Ticketing Platform
              </p>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-4">Support</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link></li>
                <li><Link to="/tickets" className="hover:text-blue-600 transition-colors">My Tickets</Link></li>
                <li><Link to="/tickets/new" className="hover:text-blue-600 transition-colors">Submit Ticket</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><Link to="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-4">Contact</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li>
                  <a href="mailto:jovann.cortes@gmail.com" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Email Me
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/jovancortes/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm font-medium">
            <p>© 2026 ResolvedYan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
