
/**
 * Middleware to verify Supabase JWT token from the Authorization header.
 * Requests without a valid token will be rejected.
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { supabaseAdmin } = await import('../config/supabase.js');
    
    // Instead of relying on local jwt.verify (which fails if Supabase switches between HS256 and RS256),
    // we use the official Supabase Admin client to fetch and validate the user directly.
    // This is mathematically secure and future-proof against any algorithm changes.
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      console.error('Supabase Auth error:', error?.message || 'User not found');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Map the Supabase user object to our req.user format so the rest of the backend still works perfectly
    req.user = {
      sub: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'customer'
    };

    next();
  } catch (error) {
    console.error('Auth middleware exception:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to ensure the authenticated user is an Admin
 */
export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.sub; // 'sub' is the Supabase User ID in the JWT

    const { supabaseAdmin } = await import('../config/supabase.js');
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error || !data || data.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    next();
  } catch (err) {
    console.error('Admin verification error:', err);
    res.status(500).json({ error: 'Failed to verify admin permissions' });
  }
};

/**
 * Middleware to ensure the authenticated user is a Staff or Admin
 */
export const requireStaffOrAdmin = async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const { supabaseAdmin } = await import('../config/supabase.js');
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error || !data || (data.role !== 'admin' && data.role !== 'staff')) {
      return res.status(403).json({ error: 'Forbidden: Staff or Admin access required' });
    }
    
    next();
  } catch (err) {
    console.error('Staff verification error:', err);
    res.status(500).json({ error: 'Failed to verify permissions' });
  }
};
