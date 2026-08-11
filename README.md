# ResolvedYan - AI-Powered Customer Ticketing System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)

Welcome to **ResolvedYan**, a modern, full-stack customer support and ticketing platform. This system provides everything an organization needs to manage customer inquiries efficiently, chat with customers in real-time, and leverage advanced AI to automatically prioritize and route tickets.

---

## 🚀 Features

ResolvedYan is built to handle end-to-end customer support workflows with robust security and modern AI capabilities.

### 🛡️ Role-Based Access Control (RBAC)
- **Customer**: Can create tickets, view their own tickets, and chat with support.
- **Staff**: Can view the global queue, take ownership of tickets, respond to customers, and resolve tickets.
- **Admin**: Full access, including staff management and system analytics.
- **Enforcement**: Routes are protected on both the frontend (React Router) and the backend (Express middleware validating Supabase JWTs).

### 🤖 AI Ticket Prioritization
- Automatically evaluates incoming tickets using **Gemini 3.5 Flash-Lite** (via OpenRouter).
- Analyzes subject and description against strict business rules.
- Synchronously assigns a priority of `Low`, `Medium`, or `High` before the ticket is saved to the database.

### 💬 Real-Time Live Chat
- Floating chat widget powered by **Supabase Realtime**.
- Customers and agents can converse seamlessly without refreshing the page.
- Messages are instantly synced across all active sessions.

### 🎫 Customer Portal & Global Queue
- **Customer View**: A sleek dashboard for customers to create, track, and manage their support tickets.
- **Staff View**: A powerful interface for filtering, searching, taking ownership of, and resolving tickets across the entire platform.

### 🔒 Advanced Security & Authentication
- Secure email magic links, staff invite links, and password resets powered by Supabase Auth.
- **Strict Backend Moderation**: A heartbeat monitoring system instantly evicts and suspends malicious or banned users in real-time.
- All database mutations bypass insecure client-side calls and are securely processed through a hardened Node.js/Express backend.
- Rate limiting implemented via `express-rate-limit` to prevent brute-force attacks.

### 📊 Analytics Dashboard
- Visual insights into ticket volume, resolution times, and team performance for Admins.

---

## 🛠️ Architecture & Tech Stack

ResolvedYan is a modern full-stack web application built for performance, security, and real-time collaboration.

### Frontend (`client/`)
- **React 18** - Component-based UI library.
- **Vite** - Lightning-fast frontend build tool and development server.
- **Tailwind CSS** - Utility-first styling for a premium, responsive design.
- **React Router** - Client-side routing and protected routes.

### Backend (`server/`)
- **Node.js & Express** - Scalable backend API handling all critical business logic.
- **Zod** - Schema declaration and validation for incoming requests.
- **Express Rate Limit** - Protection against brute-force attacks.

### Database & Authentication
- **Supabase (PostgreSQL)** - Primary database, Authentication, and Storage.
- **Supabase Realtime** - WebSockets for instant chat messaging and dashboard updates.
- **Supabase Admin Auth API** - Secure server-side user moderation, JWT verification, and staff invites (bypassing client-side RLS securely).

### AI Integration
- **OpenRouter** - Unified API gateway for accessing LLMs.
- **Gemini 3.5 Flash-Lite** - Highly accurate ticket prioritization based on strict business rules.

---

## 📂 Project Structure

```text
├── server/                  # Node.js backend infrastructure
│   ├── config/              # Supabase admin client initialization
│   ├── controllers/         # Request handling and logic (auth, tickets, customers)
│   ├── middleware/          # JWT verification, RBAC (requireStaffOrAdmin), validation
│   ├── repositories/        # Direct database interaction queries
│   ├── routes/              # Express API endpoints
│   ├── services/            # Business logic and external API integrations (e.g., aiService.js)
│   └── index.js             # Express server entry point
└── client/                  # React frontend
    ├── src/
    │   ├── components/      # Reusable UI (GlobalChatWidget, Badges, Tables)
    │   ├── context/         # Global state (AuthContext with heartbeat)
    │   ├── layouts/         # Page wrappers (DashboardLayout)
    │   ├── lib/             # Supabase client and API fetch wrappers
    │   ├── pages/           # Main route views (Profile, Analytics, Queue)
    │   └── main.jsx         # React application entry point
```

---

## 🚦 Getting Started (Local Setup)

### Prerequisites
- **Node.js** (v18 or higher)
- A **Supabase Project** (with Auth, Database, and Storage enabled)
- An **OpenRouter Account** (for AI integrations)

### 1. Environment Variables

**Frontend (`client/.env.local`)**
Create this file in the `client/` directory:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Backend (`server/.env`)**
Create this file in the `server/` directory:
```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

### 2. Running Locally

To run the application, you must start both the frontend and backend servers.

**Start the Backend:**
```bash
cd server
npm install
npm run dev
```
*The Express server will start on port `3000`.*

**Start the Frontend:**
```bash
cd client
npm install
npm run dev
```
*The React app will start on port `5173`.*

### 3. Initial Setup

1. Open the app at `http://localhost:5173`.
2. Sign up to create the first user (this will be a Customer by default).
3. Go into your Supabase Dashboard -> Table Editor -> `profiles` table.
4. Manually change your user's role from `customer` to `admin`.
5. Refresh the page to access the Admin dashboard. You can now invite Staff members from the UI.

---


