import type { Prisma } from '@prisma/client';

import prisma from '../config/prisma';

type ProductCreateInput = {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
};

type ProductUpdateInput = Partial<
  Pick<ProductCreateInput, 'name' | 'description' | 'price' | 'image' | 'category' | 'stock'>
>;

function buildProductWhere(
  keyword?: string,
  category?: string,
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { deletedAt: null };

  if (keyword !== undefined && keyword !== '') {
    where.OR = [
      { name: { contains: keyword } },
      { description: { contains: keyword } },
    ];
  }

  if (category !== undefined && category !== '' && category !== 'all') {
    where.category = category;
  }

  return where;
}

export const ProductModel = {
  async create(data: ProductCreateInput) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        category: data.category,
        stock: data.stock,
      },
    });
  },

  async findAll(
    keyword?: string,
    page = 1,
    pageSize = 12,
    category?: string,
  ) {
    const where = buildProductWhere(keyword, category);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      pages: Math.ceil(total / pageSize),
    };
  },

  async getCategories(): Promise<string[]> {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return products
      .map((p: { category: string }) => p.category)
      .filter((c: string): boolean => c !== null && c !== undefined && c !== '');
  },

  async findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  },

  async update(id: string, data: ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
