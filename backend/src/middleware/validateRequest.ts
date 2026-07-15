import type { Request, Response, NextFunction } from 'express';
import { z, type ZodSchema, ZodError } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Generic validation middleware using Zod.
 *
 * Usage:
 * ```ts
 * router.post('/', validateRequest({ body: createUserSchema }), handler);
 * ```
 */
export const validateRequest = (schemas: ValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body !== undefined) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      if (schemas.query !== undefined) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      if (schemas.params !== undefined) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({ message: 'Validation failed', errors });
        return;
      }

      next(error as Error);
    }
  };
};

/* ── Reusable validation schemas ── */

export const idSchema = z.string().uuid();

export const emailSchema = z.string().email('Invalid email format');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password too long');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});

export const searchSchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
});

export const createProductSchema = z.object({
  name: nameSchema,
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  price: z.number().positive('Price must be positive'),
  image: z.string().url('Invalid image URL'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const createOrderSchema = z.object({
  orderItems: z
    .array(
      z.object({
        product: z.string().uuid('Invalid product ID'),
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
        image: z.string().url(),
      }),
    )
    .min(1, 'At least one item is required'),
  shippingAddress: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().regex(/^\d{5}$/, 'Invalid postal code'),
    country: z.string().min(1, 'Country is required'),
  }),
  paymentMethod: z.enum(['stripe', 'paypal']),
  totalPrice: z.number().positive(),
});
