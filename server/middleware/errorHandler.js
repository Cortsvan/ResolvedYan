/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  const statusCode = err.statusCode || 500;
  
  // Sanitize message: Do not leak internal Supabase/DB errors
  let message = 'Internal Server Error';
  if (statusCode !== 500 && err.message) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    error: message
  });
};
