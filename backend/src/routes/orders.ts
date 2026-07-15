import { Router } from 'express';
import { z } from 'zod';

import { validationError } from '../errors/AppError';
import { AuthRequest, protect } from '../middleware/auth';
import { OrderService } from '../services';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/* ── Schema ── */

const createOrderSchema = z.object({
  orderItems: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID required'),
        name: z.string().min(1, 'Name required'),
        quantity: z.number().int().positive('Quantity must be positive'),
        price: z.number().positive('Price must be positive'),
        image: z.string().optional().default(''),
      }),
    )
    .min(1, 'At least one item required'),
  shippingAddress: z.union([
    z.object({
      address: z.string().min(1, 'Address required'),
      city: z.string().min(1, 'City required'),
      postalCode: z.string().min(1, 'Postal code required'),
      country: z.string().min(1, 'Country required'),
    }),
    z.string(),
  ]),
  paymentMethod: z.string().min(1, 'Payment method required'),
  totalPrice: z.number().positive('Total price required'),
});

/* ── POST /api/orders ── */
router.post(
  '/',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      throw validationError(
        parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      );
    }

    const actor = {
      userId: req.user!.id,
      isAdmin: req.user!.isAdmin,
      correlationId: req.correlationId ?? 'unknown',
    };

    const order = await OrderService.create(parsed.data, actor);
    res.status(201).json(order);
  }),
);

/* ── GET /api/orders (user's orders) ── */
router.get(
  '/',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const actor = {
      userId: req.user!.id,
      isAdmin: req.user!.isAdmin,
      correlationId: req.correlationId ?? 'unknown',
    };
    const orders = await OrderService.byUser(actor);
    res.json(orders);
  }),
);

/* ── GET /api/orders/admin/all ── */
router.get(
  '/admin/all',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const actor = {
      userId: req.user!.id,
      isAdmin: req.user!.isAdmin,
      correlationId: req.correlationId ?? 'unknown',
    };
    const orders = await OrderService.all(actor);
    res.json(orders);
  }),
);

/* ── GET /api/orders/:id ── */
router.get(
  '/:id',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const actor = {
      userId: req.user!.id,
      isAdmin: req.user!.isAdmin,
      correlationId: req.correlationId ?? 'unknown',
    };
    const order = await OrderService.byId(req.params.id, actor);
    res.json(order);
  }),
);

/* ── PUT /api/orders/:id/pay ── */
router.put(
  '/:id/pay',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const { paymentIntentId } = req.body as { paymentIntentId?: string };
    if (paymentIntentId === undefined || paymentIntentId === '') {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Payment intent ID is required' } });
      return;
    }

    const actor = {
      userId: req.user!.id,
      isAdmin: req.user!.isAdmin,
      correlationId: req.correlationId ?? 'unknown',
    };

    const order = await OrderService.confirmPayment(req.params.id, paymentIntentId, actor);
    res.json(order);
  }),
);

/* ── PUT /api/orders/:id/deliver (admin) ── */
router.put(
  '/:id/deliver',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const actor = {
      userId: req.user!.id,
      isAdmin: req.user!.isAdmin,
      correlationId: req.correlationId ?? 'unknown',
    };
    const order = await OrderService.markAsDelivered(req.params.id, actor);
    res.json(order);
  }),
);

export default router;
