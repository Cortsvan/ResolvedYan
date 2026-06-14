# ResolvedYan - AI-Powered Customer Ticketing System

Welcome to **ResolvedYan**, a modern, full-stack customer support and ticketing platform. This system provides everything an organization needs to manage customer inquiries efficiently, chat with customers in real-time, and lay the groundwork for advanced AI integrations.

---

## 🚀 Features

- **Role-Based Access Control (RBAC):** Three distinct tiers (Customer, Staff, Admin) with strictly enforced routing and backend authorization.
- **Real-Time Live Chat:** A floating chat widget powered by Supabase Realtime, allowing customers and agents to converse seamlessly without refreshing the page.
- **Customer Portal:** A sleek dashboard for customers to create, track, and manage their support tickets.
- **Global Ticket Queue:** A powerful admin/staff interface for filtering, searching, taking ownership of, and resolving tickets across the entire platform.
- **Secure Backend API:** All database mutations (creating tickets, sending messages, updating profiles) are securely processed through a hardened Node.js/Express backend, completely preventing unauthorized frontend tampering.
- **Real-Time Moderation:** A strict heartbeat monitoring system that can instantly evict and suspend malicious or banned users from the platform in real-time.
- **Advanced Authentication & Avatars:** Powered by Supabase, featuring secure email magic links, staff invite links, password resets, and user profile pictures using Supabase Storage.
- **Analytics Dashboard:** Visual insights into ticket volume, resolution times, and team performance.
- **AI-Ready Infrastructure:** Backend routes pre-configured for seamless integration with LLMs (OpenAI, Gemini, Claude) for ticket auto-categorization and suggested responses.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **React 18** - UI Library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling for a premium, responsive design
- **React Router** - Client-side routing and protected routes

### Backend (`server/`)
- **Node.js & Express** - Scalable backend API featuring Zod validation and Express Rate Limiting
- **Supabase (PostgreSQL)** - Database, Authentication, Storage, and Row Level Security (RLS)
- **Supabase Admin Auth API** - Secure server-side user moderation, JWT verification, and staff invites

---

## 📂 Project Structure

```
├── server/                  # Node.js backend infrastructure
│   ├── config/              # Supabase admin client initialization
│   ├── controllers/         # Request handling and logic (auth, tickets, customers)
│   ├── middleware/          # JWT verification, RBAC (requireStaffOrAdmin), validation
│   ├── repositories/        # Direct database interaction queries
│   ├── routes/              # Express API endpoints
│   └── index.js             # Express server entry point (port 3000)
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI (GlobalChatWidget, Badges, Tables)
│   │   ├── context/         # Global state (AuthContext with heartbeat)
│   │   ├── layouts/         # Page wrappers (DashboardLayout)
│   │   ├── lib/             # Supabase client and API fetch wrappers
│   │   ├── pages/           # Main route views (Profile, Analytics, Queue)
│   │   └── main.jsx         # React application entry point
└── README.md
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase Project (with Auth, Database, and Storage enabled)
- A `client/.env.local` file with your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- A `server/.env` file with your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### Running Locally
To run the application, you must start both the frontend and backend servers.

1. **Start the Backend:**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   *The Express server will start on port `3000`.*

2. **Start the Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *The React app will start on port `5173`.*

---

*This project is actively under development.*
