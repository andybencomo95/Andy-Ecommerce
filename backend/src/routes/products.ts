import { Router } from 'express';
import { z } from 'zod';

import { validationError } from '../errors/AppError';
import { AuthRequest, protect } from '../middleware/auth';
import { ProductService } from '../services';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/* ── Schemas ── */

const createProductSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().positive(),
  image: z.string().url(),
  category: z.string().min(1),
  stock: z.number().int().min(0).default(0),
});

const updateProductSchema = createProductSchema.partial();

/* ── GET /api/products ── */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const keyword = req.query.keyword as string | undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 12));
    const category = req.query.category as string | undefined;

    const result = await ProductService.list({ keyword, page, pageSize, category });
    res.json(result);
  }),
);

/* ── GET /api/products/categories ── */
router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await ProductService.getCategories();
    res.json(categories);
  }),
);

/* ── GET /api/products/:id ── */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await ProductService.byId(req.params.id);
    res.json(product);
  }),
);

/* ── POST /api/products (admin) ── */
router.post(
  '/',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const parsed = createProductSchema.safeParse(req.body);
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
    const product = await ProductService.create(parsed.data, actor);
    res.status(201).json(product);
  }),
);

/* ── PUT /api/products/:id (admin) ── */
router.put(
  '/:id',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const parsed = updateProductSchema.safeParse(req.body);
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
    const product = await ProductService.update(req.params.id, parsed.data, actor);
    res.json(product);
  }),
);

/* ── DELETE /api/products/:id (admin) ── */
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const actor = {
      userId: req.user!.id,
      isAdmin: req.user!.isAdmin,
      correlationId: req.correlationId ?? 'unknown',
    };
    await ProductService.remove(req.params.id, actor);
    res.json({ message: 'Product removed' });
  }),
);

export default router;
