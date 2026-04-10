import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

// ============================================
// VALIDACIÓN CON ZOD - Why? 
// La validación de inputs es crítica para la seguridad.
// Zod permite definir esquemas de validación de forma declarativa
// y tipada, detectando errores antes de que lleguen a la lógica de negocio.
// Además genera mensajes de error claros para el usuario.
// ============================================

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Middleware de validación genérico
 * @param schemas - Esquemas de validación para body, query y params
 * 
 * Ejemplo de uso:
 * ```typescript
 * const createUserSchema = z.object({
 *   email: z.string().email(),
 *   name: z.string().min(2),
 *   password: z.string().min(6)
 * });
 * 
 * router.post('/', validateRequest({ body: createUserSchema }), createUser);
 * ```
 */
export const validateRequest = (schemas: ValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar cada parte de la request
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      
      if (schemas.query) {
        // Transformar query strings a objeto si es necesario
        req.query = await schemas.query.parseAsync(req.query);
      }
      
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatear errores de Zod para respuesta clara
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          message: 'Validation failed',
          errors,
        });
      }
      
      // Si es otro tipo de error, pasarlo al handler de errores
      next(error);
    }
  };
};

// ============================================
// ESQUEMAS DE VALIDACIÓN REUTILIZABLES
// Estos esquemas pueden importarse en las rutas
// ============================================

// ID de mongo/UUID
export const idSchema = z.string().uuid();

// Email válido
export const emailSchema = z.string().email('Invalid email format');

// Password con requisitos mínimos
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password too long');

// Nombre válido
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long');

// Esquema para paginación
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});

// Esquema para búsqueda
export const searchSchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
});

// Esquema para creación de producto
export const createProductSchema = z.object({
  name: nameSchema,
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  price: z.number().positive('Price must be positive'),
  image: z.string().url('Invalid image URL'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
});

// Esquema para actualización de producto
export const updateProductSchema = createProductSchema.partial();

// Esquema para creación de orden
export const createOrderSchema = z.object({
  orderItems: z.array(z.object({
    product: z.string().uuid('Invalid product ID'),
    name: z.string().min(1),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    image: z.string().url(),
  })).min(1, 'At least one item is required'),
  
  shippingAddress: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().regex(/^\d{5}$/, 'Invalid postal code'),
    country: z.string().min(1, 'Country is required'),
  }),
  
  paymentMethod: z.enum(['stripe', 'paypal']),
  totalPrice: z.number().positive(),
});