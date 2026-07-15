import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      name: true,
      price: true,
      category: true,
      stock: true
    },
    take: 12
  });

  console.log('📦 Productos en la base de datos:\n');
  console.table(products);
}

main()
  .finally(() => prisma.$disconnect());
