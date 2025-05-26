/* eslint-disable no-console */
import { PrismaClient, UserRoleType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  // Clean existing data
  await prisma.$transaction([
    prisma.userRole.deleteMany(),
    prisma.user.deleteMany(),
    prisma.role.deleteMany(),
  ]);

  // Create roles
  const [adminRole, userRole] = await Promise.all([
    prisma.role.create({
      data: {
        name: UserRoleType.ADMIN,
        description: 'Administrator role',
      },
    }),
    prisma.role.create({
      data: {
        name: UserRoleType.USER,
        description: 'Regular user role',
      },
    }),
  ]);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      password: await bcrypt.hash('Admin@123', SALT_ROUNDS),
      firstName: 'Admin',
      lastName: 'User',
      telephone: '1234567890',
      isVerified: true,
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });

  // Create regular user
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@gmail.com',
      password: await bcrypt.hash('User@123', SALT_ROUNDS),
      firstName: 'Regular',
      lastName: 'User',
      telephone: '0987654321',
      isVerified: true,
      roles: {
        create: {
          roleId: userRole.id,
        },
      },
    },
  });

  console.log('Seeding completed!');
  console.log('Admin user:', adminUser.email);
  console.log('Regular user:', regularUser.email);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
