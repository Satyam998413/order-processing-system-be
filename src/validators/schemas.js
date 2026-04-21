import { z } from 'zod';

/**
 * Order schema
 */
export const orderSchema = z.object({
  order_id: z.string().uuid(),
  customer_id: z.string().min(1).max(255),
  order_date: z.string().datetime(),
  order_amount: z.number().positive(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
});

/**
 * Batch insert schema
 */
export const batchOrdersSchema = z.array(orderSchema);

/**
 * File upload schema
 */
export const fileUploadSchema = z.object({
  file: z.object({
    filename: z.string(),
    mimetype: z.enum(['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  }),
});

/**
 * Login schema (for demo authentication)
 */
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

/**
 * Validate data with schema
 */
export const validateData = async (schema, data) => {
  try {
    return await schema.parseAsync(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new Error(JSON.stringify(errors));
    }
    throw err;
  }
};
