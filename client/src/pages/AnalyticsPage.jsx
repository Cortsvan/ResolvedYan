import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  Area, AreaChart,
} from "recharts";
import { supabase } from "../lib/supabase";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";

const PIE_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="text-xs font-semibold text-slate-600 mb-1">{label}</p>
        <p className="text-sm font-bold text-indigo-600">
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
        const { data, error } = await supabase.from("tickets").select("*").neq("category", "Live Chat");
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

  // Process data for charts
  const categoryMap = {};
  const priorityMap = {};
  const monthMap = {};

  tickets.forEach(t => {
    // Categories
    categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
    // Priorities
    priorityMap[t.priority] = (priorityMap[t.priority] || 0) + 1;
    // Months
    const date = new Date(t.created_at);
    const month = date.toLocaleString('default', { month: 'short' });
    monthMap[month] = (monthMap[month] || 0) + 1;
  });

  const byCategory = Object.keys(categoryMap).map(k => ({ category: k, count: categoryMap[k] }));
  const byPriority = Object.keys(priorityMap).map(k => ({ priority: k, count: priorityMap[k] }));
  
  // Sort months properly or just use as is for a simple trend line
  const monthly = Object.keys(monthMap).map(k => ({ month: k, count: monthMap[k] }));
  
  // If no data yet, provide defaults to prevent crashes
  if (monthly.length === 0) {
    monthly.push({ month: "Jan", count: 0 });
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">
          Visual insights into your support ticket data.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Tickets" 
          value={loading ? "-" : total} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>} 
          color="indigo" 
        />
        <StatCard
          title="Avg. Per Month"
          value={loading ? "-" : Math.round(monthly.reduce((a, b) => a + b.count, 0) / monthly.length)}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
          color="blue"
        />
        <StatCard
          title="High Priority"
          value={loading ? "-" : tickets.filter(t => t.priority === "High").length}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>}
          color="red"
        />
        <StatCard
          title="Resolution Rate"
          value={loading ? "-" : total === 0 ? "0%" : `${Math.round((tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length / total) * 100)}%`}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-1">Tickets by Category</h2>
          <p className="text-xs text-slate-400 mb-5">Distribution across support categories</p>
          
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={byCategory}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] w-full flex flex-col items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span className="text-sm font-medium">No category data yet</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-1">Priority Distribution</h2>
          <p className="text-xs text-slate-400 mb-5">Breakdown of tickets by urgency level</p>
          
          {byPriority.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={byPriority}
                    dataKey="count"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                  >
                    {byPriority.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} tickets`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="flex flex-col gap-2.5">
                {byPriority.map((entry, index) => (
                  <div key={entry.priority} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{entry.priority}</p>
                      <p className="text-xs text-slate-400">{entry.count} tickets</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] w-full flex flex-col items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
              <span className="text-sm font-medium">No priority data yet</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-slate-900 mb-1">Monthly Ticket Volume</h2>
        <p className="text-xs text-slate-400 mb-5">Ticket submissions over time</p>
        
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={monthly}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="ticketGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fill="url(#ticketGradient)"
              dot={{ fill: "#4f46e5", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-bold text-slate-900 mb-5">Category Breakdown</h2>
        
        <div className="space-y-3">
          {byCategory.length > 0 ? byCategory.map((item, index) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            const colors = [
              "bg-indigo-500", "bg-blue-500", "bg-emerald-500",
              "bg-amber-500", "bg-rose-500"
            ];
            
            return (
              <div key={item.category}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{item.category}</span>
                  <span className="text-slate-400">
                    {item.count} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-700`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          }) : (
            <div className="py-4 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-lg bg-slate-50">
              <span className="text-sm font-medium">No category data yet</span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AnalyticsPage;
