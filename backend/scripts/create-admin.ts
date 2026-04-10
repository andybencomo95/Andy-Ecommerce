import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const password = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@admin.com',
      password,
      isAdmin: true,
      isEmailVerified: true,
    },
  });

  console.log('✅ Admin creado:', admin);
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());