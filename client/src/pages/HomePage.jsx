import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

// ============================================================
// FEATURES DATA
// ============================================================
const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082" />
      </svg>
    ),
    color: "bg-blue-100 text-blue-600",
    title: "AI Auto-Classification",
    description: "AI reads every incoming ticket and instantly assigns category, priority, and sentiment — zero manual sorting required.",
    tag: "Powered by GPT-4",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    color: "bg-blue-100 text-blue-600",
    title: "n8n Workflow Automation",
    description: "Trigger Slack alerts, send emails, auto-assign agents, and escalate critical tickets — all without writing code.",
    tag: "No-code workflows",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    color: "bg-blue-100 text-blue-600",
    title: "Real-Time Analytics",
    description: "Track SLA compliance, agent performance, ticket volumes, and resolution rates with live charts and smart insights.",
    tag: "Live dashboards",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    color: "bg-blue-100 text-blue-600",
    title: "Smart Notifications",
    description: "Customers receive real-time updates at every stage. Agents get instant alerts on new critical or escalated tickets.",
    tag: "Multi-channel alerts",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    color: "bg-blue-100 text-blue-600",
    title: "API-First Integration",
    description: "Connect to PostgreSQL, Node.js, Slack, Twilio, or any REST API. Built to plug into your existing stack effortlessly.",
    tag: "REST & Webhooks",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    color: "bg-blue-100 text-blue-600",
    title: "Priority-Based Routing",
    description: "High priority tickets skip the queue and go directly to senior agents. SLA timers ensure nothing falls through the cracks.",
    tag: "Smart escalation",
  },
];

// ============================================================
// PROCESS STEPS
// ============================================================
const steps = [
  {
    number: "01",
    icon: "✏️",
    title: "Customer Submits",
    description: "Customer fills a clean form. AI pre-fills category and priority from the description text.",
  },
  {
    number: "02",
    icon: "🤖",
    title: "AI Classifies & Routes",
    description: "GPT-4 analyzes the ticket and routes it to the right agent based on expertise and availability.",
  },
  {
    number: "03",
    icon: "⚡",
    title: "Automated Workflows",
    description: "n8n triggers Slack notifications, email confirmations, and SLA timers the moment a ticket is created.",
  },
  {
    number: "04",
    icon: "✅",
    title: "Resolved & Logged",
    description: "Agent resolves the ticket. Analytics update in real time. Customer receives a satisfaction survey.",
  },
];

// ============================================================
// TRUST / INTEGRATION LOGOS
// ============================================================
const integrations = [
  { name: "PostgreSQL", icon: "🗄️" },
  { name: "Node.js", icon: "⚡" },
  { name: "n8n", icon: "🔗" },
  { name: "OpenAI", icon: "🤖" },
  { name: "Slack", icon: "💬" },
  { name: "Twilio", icon: "📱" },
];

// ============================================================
// DASHBOARD PREVIEW MOCKUP COMPONENT
// Flat, light, professional B2B mockup
// ============================================================
function DashboardMockup() {
  const mockTickets = [
    { id: "TKT-001", subject: "Payment deducted, order failed", priority: "High", status: "Open", time: "2m ago" },
    { id: "TKT-002", subject: "Cannot log into account", priority: "High", status: "In Progress", time: "8m ago" },
    { id: "TKT-003", subject: "Upgrade subscription plan", priority: "Low", status: "Resolved", time: "1h ago" },
    { id: "TKT-004", subject: "API integration returning 401", priority: "High", status: "Open", time: "12m ago" },
  ];

  const priorityStyle = {
    High:     "bg-orange-100 text-orange-700",
    Low:      "bg-emerald-100 text-emerald-700",
  };
  const statusStyle = {
    Open:        "bg-blue-100 text-blue-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    Resolved:    "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="mockup-shadow rounded-2xl overflow-hidden border border-slate-200 bg-white animate-float">
      {/* Window chrome bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        <div className="ml-3 flex-1 bg-white border border-slate-200 rounded h-5 flex items-center px-2">
          <span className="text-[10px] text-slate-400">app.support.ai/admin</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-40 border-r border-slate-100 bg-slate-50 p-3 hidden sm:block">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Menu</div>
          {[
            { icon: "📊", label: "Dashboard", active: false },
            { icon: "⚙️", label: "Admin", active: true },
            { icon: "🎫", label: "Tickets", active: false },
            { icon: "📈", label: "Analytics", active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 text-xs font-medium ${
                item.active
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
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { label: "Total", value: "248", change: "+12%" },
              { label: "Open", value: "43", change: "+3" },
              { label: "High", value: "7", change: "↑2" },
              { label: "Resolved", value: "198", change: "+18" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                <div className="text-[10px] text-slate-500 font-medium mb-1">{stat.label}</div>
                <div className="text-lg font-bold text-slate-800">{stat.value}</div>
                <div className="text-[9px] text-emerald-600 mt-0.5 font-medium">{stat.change}</div>
              </div>
            ))}
          </div>

          {/* Tickets table */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-600">Recent Tickets</span>
              <span className="text-[9px] text-blue-600 font-medium">View all →</span>
            </div>
            {mockTickets.map((ticket, i) => (
              <div
                key={ticket.id}
                className={`flex items-center gap-2 px-3 py-2 ${
                  i < mockTickets.length - 1 ? "border-b border-slate-50" : ""
                }`}
              >
                <span className="font-mono text-[9px] text-slate-400 hidden sm:block w-14 flex-shrink-0">
                  {ticket.id}
                </span>
                <span className="text-[10px] text-slate-700 font-medium flex-1 truncate">{ticket.subject}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${priorityStyle[ticket.priority] || ""}`}>
                  {ticket.priority}
                </span>
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
// ANIMATED COUNTER HOOK
// ============================================================
function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatItem({ value, suffix = "", label, delay = 0 }) {
  const { count, ref } = useCountUp(value);
  return (
    <div
      ref={ref}
      className="text-center animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="text-4xl md:text-5xl font-black text-slate-900 tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-slate-500 mt-1 font-medium">{label}</div>
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
                AI Classification Active
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-slate-900 mb-6">
                Customer Support
                <br />
                <span className="text-blue-600">On Autopilot.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-10 max-w-lg">
                Manage, automate, and resolve support tickets with AI classification
                and n8n workflow automation. Built for teams who need to scale support
                without scaling headcount.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link to="/tickets/new" className="btn-primary text-center justify-center shadow-sm">
                  Start for Free
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link to="/dashboard" className="btn-secondary text-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                  </svg>
                  View Live Demo
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  No credit card required
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Open source & free
                </span>
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
          INTEGRATIONS LOGO BAR
          ==================================================== */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
            Integrates seamlessly with your stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {integrations.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors cursor-default"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-semibold text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          STATS SECTION
          ==================================================== */}
      <section className="bg-slate-50 py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            <StatItem value={1200} suffix="+" label="Tickets processed daily" delay={0} />
            <StatItem value={94} suffix="%" label="AI classification accuracy" delay={80} />
            <StatItem value={3} suffix="min" label="Avg. first response time" delay={160} />
            <StatItem value={99} suffix="%" label="Uptime SLA guarantee" delay={240} />
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
              Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-5">
              Everything you need to{" "}
              <span className="text-blue-600">automate support</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
              From AI-powered triage to automated workflows, this platform covers
              the full lifecycle of a support ticket.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="feature-card"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${feature.color}`}>
                  {feature.icon}
                </div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 mb-3">
                  {feature.tag}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                <button className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group">
                  Learn more
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
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
              From ticket to resolution{" "}
              <span className="text-blue-600">in minutes</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
              A streamlined, AI-assisted workflow that keeps every ticket moving
              from open to resolved without bottlenecks.
            </p>
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
              Ready to ship
            </div>
            <h2 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Built for the future.
              <br />
              <span className="text-blue-600">Available today.</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed font-medium">
              Start with mock data today. Connect your PostgreSQL database,
              Node.js backend, and n8n workflows when you're ready to go live.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/tickets/new" className="btn-primary text-center justify-center shadow-sm">
                Submit Your First Ticket
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link to="/admin" className="btn-secondary text-center justify-center">
                Explore Admin Panel
              </Link>
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
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 18c0-5 4-9 9-9s9 4 9 9" />
                    <rect x="2" y="17" width="3.5" height="5" rx="1.75" fill="currentColor" stroke="none"/>
                    <rect x="18.5" y="17" width="3.5" height="5" rx="1.75" fill="currentColor" stroke="none"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 21c0 1-1 2-2.5 2" />
                  </svg>
                </div>
                <span className="text-slate-900 font-bold text-sm">ResolvedYan</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs mb-5">
                A beginner-friendly React application built with Vite, Tailwind CSS,
                and React Router. Designed for AI and n8n integration.
              </p>
              <div className="flex flex-wrap gap-2">
                {["React", "Vite", "Tailwind CSS", "React Router"].map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-500 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link></li>
                <li><Link to="/tickets" className="hover:text-blue-600 transition-colors">My Tickets</Link></li>
                <li><Link to="/tickets/new" className="hover:text-blue-600 transition-colors">New Ticket</Link></li>
                <li><Link to="/analytics" className="hover:text-blue-600 transition-colors">Analytics</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-4">Admin</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><Link to="/admin" className="hover:text-blue-600 transition-colors">Admin Panel</Link></li>
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-4">Coming Soon</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li className="flex items-center gap-2"><span>🗄️</span> PostgreSQL</li>
                <li className="flex items-center gap-2"><span>⚡</span> Node.js API</li>
                <li className="flex items-center gap-2"><span>🔗</span> n8n Workflows</li>
                <li className="flex items-center gap-2"><span>🤖</span> OpenAI GPT-4</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm font-medium">
            <p>© 2024 ResolvedYan. Built for learning React.</p>
            <p className="text-slate-500">
              Future: PostgreSQL · Node.js · n8n · OpenAI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
