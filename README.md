# TicketPH - AI-Powered Customer Ticketing System

Welcome to **TicketPH**, a modern, full-stack customer support and ticketing platform. Built with a focus on speed, beautiful UI/UX, and robust role-based security, this system provides everything an organization needs to manage customer inquiries efficiently while laying the groundwork for advanced AI integrations.

---

## 🚀 Features

- **Role-Based Access Control (RBAC):** Three distinct tiers (Customer, Staff, Admin) with strictly enforced routing and Row Level Security.
- **Customer Portal:** A sleek dashboard for customers to create, track, and manage their support tickets.
- **Global Ticket Queue:** A powerful admin/staff interface for filtering, searching, and resolving tickets across the entire platform.
- **Real-Time Moderation:** A strict heartbeat monitoring system that can instantly evict and suspend malicious or banned users from the platform in real-time.
- **Advanced Authentication:** Powered by Supabase, featuring secure email magic links, password resets, and custom SMTP integration via Resend.
- **Analytics Dashboard:** Visual insights into ticket volume, resolution times, and team performance.
- **AI-Ready Infrastructure:** Backend routes pre-configured for seamless integration with LLMs (OpenAI, Gemini, Claude) for ticket auto-categorization and suggested responses.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling for a premium, responsive design
- **React Router** - Client-side routing and protected routes

### Backend
- **Node.js & Express** - Scalable backend API
- **Supabase (PostgreSQL)** - Database, Authentication, and Row Level Security (RLS)
- **Supabase Admin Auth API** - Secure server-side user moderation and validation

### External Integrations
- **Resend** (Optional) - High-deliverability custom SMTP for authentication emails

---

## 📂 Project Structure

```
├── server/                  # Node.js backend infrastructure
│   ├── middleware/          # Express route protection & JWT decoding
│   ├── routes/              # API endpoints (customers, staff, AI)
│   └── index.js             # Express server entry point
├── src/                     # React frontend
│   ├── components/          # Reusable UI components (Badges, Tables)
│   ├── context/             # Global state (AuthContext with heartbeat)
│   ├── layouts/             # Page wrappers (DashboardLayout)
│   ├── lib/                 # Third-party wrappers (Supabase client, API fetches)
│   ├── pages/               # Main route views
│   └── routes/              # AppRoutes.jsx definition
└── ...
```

---

## 🚦 Getting Started

*(Documentation to be expanded as development continues...)*

### Prerequisites
- Node.js (v18+)
- A Supabase Project
- A `.env.local` file with your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- A `server/.env` file with your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### Running Locally
1. Install dependencies: `npm install`
2. Start the development environment: `npm run dev`
3. The frontend will run on port `5173` and the backend will run on port `3000`.

---

*This project is actively under development.*
