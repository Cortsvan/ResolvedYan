import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  Area, AreaChart,
} from "recharts";
import { supabase } from "../lib/supabase";
import DashboardLayout from "../layouts/DashboardLayout";

const PIE_COLORS = ["#2563eb", "#0284c7", "#10b981", "#f59e0b", "#ef4444"];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
        <p className="font-bold text-slate-700 mb-1">{label}</p>
        <p className="font-black text-blue-600">
          {payload[0].value} tickets
        </p>
      </div>
    );
  }
  return null;
}

function AnalyticsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllTickets = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("*")
          .neq("category", "Live Chat");
        if (error) throw error;
        setTickets(data || []);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTickets();
  }, []);

  const total = tickets.length;
  const highPriorityCount = tickets.filter(t => t.priority === "High").length;
  const resolvedCount = tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length;

  // Process data for charts
  const categoryMap = {};
  const priorityMap = {};
  const monthMap = {};

  tickets.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
    priorityMap[t.priority] = (priorityMap[t.priority] || 0) + 1;
    const date = new Date(t.created_at);
    const month = date.toLocaleString('default', { month: 'short' });
    monthMap[month] = (monthMap[month] || 0) + 1;
  });

  const byCategory = Object.keys(categoryMap).map(k => ({ category: k, count: categoryMap[k] }));
  const byPriority = Object.keys(priorityMap).map(k => ({ priority: k, count: priorityMap[k] }));
  const monthly = Object.keys(monthMap).map(k => ({ month: k, count: monthMap[k] }));
  
  if (monthly.length === 0) {
    monthly.push({ month: "Aug", count: 0 });
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Analytics & Insights
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 flex items-center gap-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Performance
              </span>
            </div>
            <p className="text-slate-500 text-sm sm:text-base">
              Real-time ticket volume distributions, priority ratios, and historical resolution trends.
            </p>
          </div>
        </div>

        {/* 4 Metric Cards with Black Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tickets</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{loading ? "-" : total}</div>
            <p className="text-xs text-slate-400 mt-1 font-medium">All logged requests</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg. Monthly Volume</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? "-" : Math.round(monthly.reduce((a, b) => a + b.count, 0) / monthly.length)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Requests per period</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">High Priority</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{loading ? "-" : highPriorityCount}</div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Critical issues</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Tickets</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{loading ? "-" : resolvedCount}</div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Successfully completed</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Category Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
            <h2 className="text-base font-bold text-slate-900 mb-1">Tickets by Category</h2>
            <p className="text-xs text-slate-500 mb-6">Distribution across support domains</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Pie Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
            <h2 className="text-base font-bold text-slate-900 mb-1">Priority Breakdown</h2>
            <p className="text-xs text-slate-500 mb-6">Ratio of low, medium, and high severity tickets</p>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byPriority}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="priority"
                  >
                    {byPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2 flex-wrap">
              {byPriority.map((entry, index) => (
                <div key={entry.priority} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                  <span>{entry.priority}: <strong>{entry.count}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
            <h2 className="text-base font-bold text-slate-900 mb-1">Ticket Volume Trends</h2>
            <p className="text-xs text-slate-500 mb-6">Historical incoming request timeline</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ticketAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#ticketAreaGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default AnalyticsPage;
