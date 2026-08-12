import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

// Initialize the app
const app = express();
// Trust Railway's proxy so the rate limiter can see the real IP addresses
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());

// CORS must come BEFORE rate limiting so blocked requests still get CORS headers
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Middleware
app.use(express.json({ limit: '1mb' }));

// Routes
import aiRoutes from './routes/ai.js';
import inviteRoutes from './routes/invite.js';
import staffRoutes from './routes/staff.js';
import customersRoutes from './routes/customers.js';
import authRoutes from './routes/auth.js';
import ticketsRoutes from './routes/tickets.js';

app.use('/api/ai', aiRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler (must be the last middleware)
import { errorHandler } from './middleware/errorHandler.js';
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
