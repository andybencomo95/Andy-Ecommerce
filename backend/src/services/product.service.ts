import { notFound, forbidden, badRequest } from '../errors/AppError';
import { ProductModel } from '../models/Product';
import type { ActorContext } from '../types';
import { productLogger } from '../utils/logger';

import { getCache } from './cache';

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ListProductsOptions {
  keyword?: string;
  page: number;
  pageSize: number;
  category?: string;
}

export interface ProductListResult {
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
  page: number;
  pages: number;
}

/** Invalidar toda la caché de productos */
async function invalidateProductCache(): Promise<void> {
  await getCache().delByPattern('products:*');
}

export const ProductService = {
  async list(opts: ListProductsOptions): Promise<ProductListResult> {
    const cacheKey = `products:list:${opts.category ?? ''}:${opts.page}:${opts.pageSize}:${opts.keyword ?? ''}`;

    const cached = await getCache().get<ProductListResult>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const { products, total, page, pages } = await ProductModel.findAll(
      opts.keyword,
      opts.page,
      opts.pageSize,
      opts.category,
    );

    const result: ProductListResult = { products, total, page, pages };
    await getCache().set(cacheKey, result);
    return result;
  },

  async getCategories(): Promise<string[]> {
    const cacheKey = 'products:categories';

    const cached = await getCache().get<string[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const categories = await ProductModel.getCategories();
    await getCache().set(cacheKey, categories);
    return categories;
  },

  async byId(id: string) {
    const cacheKey = `products:id:${id}`;

    const cached = await getCache().get<Awaited<ReturnType<typeof ProductModel.findById>>>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const product = await ProductModel.findById(id);
    if (product === null) {
      throw notFound('Product', id);
    }

    await getCache().set(cacheKey, product);
    return product;
  },

  async create(input: CreateProductInput, actor: ActorContext): Promise<{
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    createdAt: Date;
  }> {
    if (!actor.isAdmin) {
      throw forbidden('Only administrators can create products');
    }

    const product = await ProductModel.create({
      name: input.name.trim(),
      description: input.description.trim(),
      price: input.price,
      image: input.image.trim(),
      category: input.category.trim(),
      stock: Math.max(0, Math.floor(input.stock)),
    });

    productLogger.info({ productId: product.id, actor: actor.userId }, 'Product created');
    await invalidateProductCache();

    return product;
  },

  async update(
    id: string,
    input: UpdateProductInput,
    actor: ActorContext,
  ): Promise<{
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    updatedAt: Date;
  }> {
    if (!actor.isAdmin) {
      throw forbidden('Only administrators can update products');
    }

    /* Ensure product exists before updating */
    await this.byId(id);

    const data: Record<string, string | number> = {};
    if (input.name !== undefined) { data.name = input.name.trim(); }
    if (input.description !== undefined) { data.description = input.description.trim(); }
    if (input.price !== undefined) { data.price = input.price; }
    if (input.image !== undefined) { data.image = input.image.trim(); }
    if (input.category !== undefined) { data.category = input.category.trim(); }
    if (input.stock !== undefined) { data.stock = Math.max(0, Math.floor(input.stock)); }

    if (Object.keys(data).length === 0) {
      throw badRequest('No fields to update');
    }

    const product = await ProductModel.update(id, data);

    productLogger.info({ productId: id, actor: actor.userId }, 'Product updated');
    await invalidateProductCache();

    return product;
  },

  async remove(id: string, actor: ActorContext): Promise<void> {
    if (!actor.isAdmin) {
      throw forbidden('Only administrators can delete products');
    }

    await this.byId(id);
    await ProductModel.delete(id);

    productLogger.info({ productId: id, actor: actor.userId }, 'Product deleted (soft)');
    await invalidateProductCache();
  },
};
