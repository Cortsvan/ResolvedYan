# ResolvedYan — AI-Powered Customer Ticketing System

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)

**ResolvedYan** is a full-stack customer support platform that helps businesses manage support tickets, chat with customers in real-time, and use AI to automatically prioritize incoming requests.

---

## 🚀 Features

### 🛡️ Role-Based Access Control (RBAC)
- **Customer** — Create tickets, view personal tickets, and chat with support staff.
- **Staff** — View the global ticket queue, claim tickets, respond to customers, and resolve issues.
- **Admin** — Full access including staff management, customer management, and analytics.
- Routes are protected on both the frontend (React Router) and the backend (Express middleware with Supabase JWT verification).

### 🤖 AI Ticket Prioritization
- Incoming tickets are automatically evaluated using **Gemini 3.5 Flash-Lite** via **OpenRouter**.
- Analyzes the subject and description to assign a priority of `Low`, `Medium`, or `High` before the ticket is saved.

### 💬 Real-Time Live Chat
- Floating chat widget powered by **Supabase Realtime**.
- Customers and staff can message each other instantly without refreshing the page.
- Messages are synced across all active sessions in real-time.

### 🎫 Ticketing System
- **Customer Portal** — A clean dashboard for customers to create, track, and manage their support tickets.
- **Global Ticket Queue** — A powerful interface for staff to filter, search, claim, and resolve tickets.
- **Ticket Detail View** — Full ticket history with status updates, priority badges, and live chat.

### 📊 Analytics Dashboard
- Visual insights into ticket volume, resolution times, and team performance (Staff and Admin).

### 👥 Staff & Customer Management
- **Staff Management** — Invite new staff members via email, view active staff, and manage roles.
- **Customer Management** — View registered customers, suspend or unsuspend accounts in real-time.

### 🔒 Security
- Supabase Auth for login, signup, password reset, and staff invite links.
- Custom email templates delivered via **Resend** (custom domain SMTP).
- Real-time heartbeat monitoring that instantly evicts suspended users.
- All database mutations go through a hardened Node.js/Express backend (never directly from the client).
- Rate limiting via `express-rate-limit` to prevent abuse.
- Helmet.js for HTTP security headers.

### 📬 Contact Form
- "Request a Demo" page powered by **Web3Forms** for receiving inquiries without a backend email service.

### 📄 Legal Pages
- Built-in Privacy Policy and Terms of Service pages.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **React Router** | Client-side routing and protected routes |

### Backend (`server/`)
| Technology | Purpose |
|---|---|
| **Node.js & Express** | REST API handling all business logic |
| **Zod** | Request validation and schema enforcement |
| **Helmet** | HTTP security headers |
| **Express Rate Limit** | Brute-force protection |

### Database & Auth
| Technology | Purpose |
|---|---|
| **Supabase (PostgreSQL)** | Primary database and authentication |
| **Supabase Realtime** | WebSocket-powered live chat |
| **Supabase Admin API** | Server-side user moderation and JWT verification |

### Integrations
| Technology | Purpose |
|---|---|
| **OpenRouter** | API gateway for LLM access |
| **Gemini 3.5 Flash-Lite** | AI ticket prioritization |
| **Resend** | Custom domain email delivery (SMTP) |
| **Web3Forms** | Contact form submissions |

### Deployment
| Service | Purpose |
|---|---|
| **Vercel** | Frontend hosting |
| **Railway** | Backend API hosting |

---

## 📂 Project Structure

```text
├── server/                  # Node.js backend
│   ├── config/              # Supabase admin client setup
│   ├── controllers/         # Request handlers (auth, tickets, customers, staff, AI)
│   ├── middleware/          # JWT verification, RBAC, validation, error handling
│   ├── repositories/        # Database queries
│   ├── routes/              # Express API endpoints
│   ├── services/            # Business logic (AI prioritization, ticket service, etc.)
│   ├── utils/               # Helpers (response handler, token generation)
│   └── index.js             # Server entry point
│
└── client/                  # React frontend
    ├── public/              # Static assets (favicon, icons)
    └── src/
        ├── assets/          # Images and logos
        ├── components/      # Reusable UI (ChatWidget, Sidebar, Badges, Tables)
        ├── context/         # Global state (AuthContext with heartbeat monitoring)
        ├── layouts/         # Page wrappers (DashboardLayout)
        ├── lib/             # Supabase client and API fetch helpers
        ├── pages/           # Route views (Dashboard, Analytics, Profile, Auth, etc.)
        ├── routes/          # Route definitions (AppRoutes)
        └── main.jsx         # React entry point
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- A **Supabase** project (Auth, Database, and Realtime enabled)
- An **OpenRouter** account (for AI ticket prioritization)
- A **Resend** account (for custom domain email — optional, Supabase default email works too)
- A **Web3Forms** access key (for the contact form — optional)

### 1. Clone the Repository

```bash
git clone https://github.com/Cortsvan/AI-Customer-Ticketing.git
cd AI-Customer-Ticketing
```

### 2. Environment Variables

**Frontend (`client/.env.local`)**
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WEB3FORMS_ACCESS_KEY=your-web3forms-access-key
```

**Backend (`server/.env`)**
```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENROUTER_API_KEY=your-openrouter-api-key
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Run Locally

**Backend:**
```bash
cd server
npm install
npm run dev
```
The Express server starts on `http://localhost:3000`.

**Frontend:**
```bash
cd client
npm install
npm run dev
```
The React app starts on `http://localhost:5173`.

### 4. Initial Setup

1. Open the app at `http://localhost:5173`.
2. Sign up to create your first account (defaults to the Customer role).
3. Go to your **Supabase Dashboard → Table Editor → `profiles`** table.
4. Change your user's `role` from `customer` to `admin`.
5. Refresh the page to access the Admin dashboard.
6. You can now invite Staff members directly from the Staff Management page.

---

## 🌐 Deployment

### Frontend (Vercel)
1. Import the `client/` directory into Vercel.
2. Add the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`, `VITE_WEB3FORMS_ACCESS_KEY`).
3. Deploy. The `vercel.json` rewrite rule handles SPA routing automatically.

### Backend (Railway)
1. Create a new Railway project and connect your GitHub repository.
2. Set the root directory to `/` and Railway will use the root `package.json` to build and start the server.
3. Add the environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `CLIENT_ORIGIN`).
4. Deploy.

### Email (Resend)
1. Add and verify your domain in the Resend dashboard.
2. In **Supabase Dashboard → Auth → SMTP**, enable Custom SMTP and enter your Resend credentials:
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** Your Resend API key
3. Add DKIM, SPF, and DMARC DNS records as instructed by Resend.


