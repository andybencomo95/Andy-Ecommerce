import prisma from '../config/prisma';

export const ProductModel = {
  async create(data: { 
    name: string; 
    description: string; 
    price: number; 
    image: string; 
    category: string; 
    stock: number 
  }) {
    return prisma.product.create({ data });
  },

  async findAll(keyword?: string, page: number = 1, pageSize: number = 12, category?: string) {
    const where: any = {
      deletedAt: null
    };

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } }
      ];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      total,
      page,
      pages: Math.ceil(total / pageSize)
    };
  },

  async getCategories() {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category']
    });
    return products.map(p => p.category).filter(Boolean);
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id }
    });
  },

  async update(id: string, data: Partial<{ 
    name: string; 
    description: string; 
    price: number; 
    image: string; 
    category: string; 
    stock: number 
  }>) {
    return prisma.product.update({
      where: { id },
      data
    });
  },

  // Soft delete - Why? Mantiene los datos por integridad
  // No usamos hard delete ya que el schema define deletedAt
  async delete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
};
