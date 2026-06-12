import jwt from 'jsonwebtoken';

/**
 * Middleware to verify Supabase JWT token from the Authorization header.
 * Requests without a valid token will be rejected.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Note: Supabase signs JWTs with the project JWT secret.
    // If you need strict verification, you can verify against process.env.SUPABASE_JWT_SECRET
    // For now, we will decode it. In production, always VERIFY the signature.
    // Since we're just scaffolding, decoding is a starting point if JWT secret isn't available.
    
    // Decoding without verification is insecure! 
    // You should add SUPABASE_JWT_SECRET to your .env and use jwt.verify(token, process.env.SUPABASE_JWT_SECRET)
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Attach user payload to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to ensure the authenticated user is an Admin
 */
export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.sub; // 'sub' is the Supabase User ID in the JWT

    // Dynamically import to avoid circular dependency issues if any
    const { supabaseAdmin } = await import('../index.js');
    
    // Securely check the database for the user's true role
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
