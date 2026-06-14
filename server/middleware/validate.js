import { z } from 'zod';

/**
 * Middleware to validate incoming request data against a Zod schema.
 * 
 * @param {z.ZodTypeAny} schema - The Zod schema to validate against
 * @param {'body' | 'query' | 'params'} property - The req property to validate (default: 'body')
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      // Validate the specific property of the request
      const validatedData = schema.parse(req[property]);
      
      // Replace the request data with the validated (and potentially transformed/stripped) data
      req[property] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format the errors nicely for the client
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          error: 'Validation failed',
          details: formattedErrors
        });
      }
      
      next(error);
    }
  };
};

/**
 * Common schema for validating UUIDs in route parameters.
 */
export const uuidSchema = z.object({
  id: z.string().uuid('Invalid ID format')
});
