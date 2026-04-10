import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    name: 'Laptop Pro 15"',
    description: 'Laptop de alta gama con procesador Intel i7, 16GB RAM, SSD 512GB. Perfecta para trabajo y gaming.',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=400&fit=crop',
    category: 'Electrónica',
    stock: 15
  },
  {
    name: 'Auriculares Bluetooth Pro',
    description: 'Auriculares inalámbricos con cancelación de ruido, 30 horas de batería y sonido premium.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop',
    category: 'Electrónica',
    stock: 50
  },
  {
    name: 'Smartphone Galaxy S24',
    description: 'Teléfono inteligente con cámara de 108MP, pantalla AMOLED 120Hz y batería de larga duración.',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=400&fit=crop',
    category: 'Electrónica',
    stock: 25
  },
  {
    name: 'Camiseta Algodón Premium',
    description: 'Camiseta 100% algodón orgánico, suave y transpirable. Disponible en varios colores.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17b0?w=500&h=400&fit=crop',
    category: 'Ropa',
    stock: 100
  },
  {
    name: 'Zapatillas Running Air',
    description: 'Zapatillas deportivas ultraligeras con tecnología de amortiguación avanzada.',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=400&fit=crop',
    category: 'Deportes',
    stock: 40
  },
  {
    name: 'Reloj Smart Watch',
    description: 'Reloj inteligente con monitor de frecuencia cardíaca, GPS y resistencia al agua.',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=400&fit=crop',
    category: 'Accesorios',
    stock: 30
  },
  {
    name: 'Mochila Viajera Premium',
    description: 'Mochila resistente al agua con múltiples compartimentos y puerto USB integrado.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=400&fit=crop',
    category: 'Accesorios',
    stock: 60
  },
  {
    name: 'Cámara Digital Pro',
    description: 'Cámara mirrorless de 24MP con grabación 4K, WiFi y pantalla táctil.',
    price: 799.99,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=400&fit=crop',
    category: 'Electrónica',
    stock: 12
  },
  {
    name: 'Gafas de Sol Vintage',
    description: 'Gafas de sol estilo aviador con protección UV400 y montura de metal premium.',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=400&fit=crop',
    category: 'Accesorios',
    stock: 80
  },
  {
    name: 'Consola de Videojuegos',
    description: 'Consola de última generación con 1TB de almacenamiento, controles inalámbricos incluido.',
    price: 499.99,
    image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=500&h=400&fit=crop',
    category: 'Electrónica',
    stock: 20
  },
  {
    name: 'Tablet Pro 11"',
    description: 'Tablet con pantalla Liquid Retina, compatible con Apple Pencil y chip M2.',
    price: 699.99,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=400&fit=crop',
    category: 'Electrónica',
    stock: 18
  },
  {
    name: 'Sudadera con Capucha',
    description: 'Sudadera suave de algodón con capucha y bolsillo kanguro. Perfecta para el frío.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=400&fit=crop',
    category: 'Ropa',
    stock: 75
  }
];

async function main() {
  console.log('🌱 Iniciando seeding de productos...');

  for (const product of products) {
    await prisma.product.create({
      data: product
    });
  }

  console.log(`✅ ${products.length} productos creados exitosamente!`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
