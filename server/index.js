import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Verify required env variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in server/.env");
}

// Initialize Supabase admin client (Service Role - DO NOT EXPOSE TO FRONTEND)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Routes
import aiRoutes from './routes/ai.js';
import inviteRoutes from './routes/invite.js';
import staffRoutes from './routes/staff.js';
import customersRoutes from './routes/customers.js';

app.use('/api/ai', aiRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/customers', customersRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Strict Auth Verification Endpoint
// This checks the database directly instead of trusting the cached JWT
import { requireAuth } from './middleware/auth.js';
app.get('/api/auth/verify', requireAuth, async (req, res) => {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(req.user.sub);
    
    if (error || !user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (user.banned_until && new Date(user.banned_until) > new Date()) {
      return res.status(401).json({ error: 'User is suspended' });
    }
    
    res.json({ success: true, valid: true });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
