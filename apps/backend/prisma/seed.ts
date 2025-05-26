/* eslint-disable no-console */
import { faker } from '@faker-js/faker';
import {
  OrderStatus,
  PaymentStatus,
  PaymentType,
  PrismaClient,
  UserRoleType,
} from '@prisma/client';
import bcrypt from 'bcrypt';
import { envConfig } from '../src/config/envConfig';

const prisma = new PrismaClient({
  log: envConfig.nodeEnv === 'development' ? ['warn', 'error'] : [],
});
const SALT_ROUNDS = 12;

async function clearDatabase() {
  type ModelName = keyof typeof prisma;
  const tablesToClear: ModelName[] = [
    'auditLog',
    'paymentDetails',
    'orderItems',
    'orderDetails',
    'cartItem',
    'shoppingSession',
    'wishlist',
    'productImage',
    'productVariant',
    'sellerProduct',
    'sellerPayout',
    'userPayment',
    'userAddress',
    'userRole',
    'product',
    'productInventory',
    'productCategory',
    'user',
    'role',
    'tax',
    'seller',
    'discount',
    'coupon',
  ];

  console.log('🧹 Cleaning database...');
  try {
    await prisma.$transaction(
      tablesToClear.map((table) => {
        const model = prisma[table];
        if ('deleteMany' in model) {
          return (model as any).deleteMany();
        }
        throw new Error(`Model ${String(table)} does not have deleteMany method`);
      }),
    );
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

async function seedBaseData() {
  console.log('🌱 Seeding base data...');

  // Create roles
  const roles = await Promise.all(
    Object.values(UserRoleType).map((name) =>
      prisma.role.create({
        data: {
          name,
          description: `${name.toLowerCase()} role`,
        },
      }),
    ),
  );

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      password: await bcrypt.hash('Admin@123', SALT_ROUNDS),
      firstName: 'Admin',
      lastName: 'User',
      telephone: faker.phone.number(),
      isVerified: true,
      roles: {
        create: {
          roleId: roles.find((r) => r.name === UserRoleType.ADMIN)!.id,
        },
      },
    },
  });

  // Create taxes
  await prisma.tax.createMany({
    data: [
      { country: 'US', state: 'CA', rate: 9.5 },
      { country: 'US', state: 'NY', rate: 8.875 },
      { country: 'CA', rate: 13.0 },
      { country: 'GB', rate: 20.0 },
    ],
  });

  // Create coupons
  await prisma.coupon.createMany({
    data: Array.from({ length: 5 }).map(() => ({
      code: faker.string.alphanumeric(8).toUpperCase(),
      description: faker.commerce.productDescription(),
      discountType: faker.helpers.arrayElement(['PERCENTAGE', 'FIXED']),
      discountValue: faker.number.float({ min: 5, max: 30, fractionDigits: 2 }),
      minPurchase: faker.number.float({ min: 20, max: 100, fractionDigits: 2 }),
      maxDiscount: faker.number.float({ min: 50, max: 200, fractionDigits: 2 }),
      startDate: faker.date.past(),
      endDate: faker.date.future(),
      usageLimit: faker.number.int({ min: 50, max: 200 }),
      isActive: true,
    })),
  });

  return { roles, adminUser };
}

async function seedProducts(count: number) {
  console.log('📦 Seeding products...');

  // Create categories
  const categories = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.productCategory.create({
        data: {
          name: faker.commerce.department(),
          description: faker.commerce.productDescription(),
        },
      }),
    ),
  );

  // Create products
  const products = await Promise.all(
    Array.from({ length: count }).map(async () => {
      const inventory = await prisma.productInventory.create({
        data: {
          quantity: faker.number.int({ min: 10, max: 1000 }),
          lowStockThreshold: faker.number.int({ min: 5, max: 20 }),
        },
      });

      return prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          SKU: faker.string.alphanumeric(8).toUpperCase(),
          categoryId: faker.helpers.arrayElement(categories).id,
          inventoryId: inventory.id,
          price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
          brand: faker.company.name(),
          weight: faker.number.float({ min: 0.1, max: 10, fractionDigits: 2 }),
          dimensions: {
            length: faker.number.float({ min: 5, max: 50 }),
            width: faker.number.float({ min: 5, max: 50 }),
            height: faker.number.float({ min: 5, max: 50 }),
          },
          tags: faker.helpers.arrayElements(['new', 'sale', 'trending', 'popular'], 2),
          isPublished: true,
          productImage: {
            create: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }).map(() => ({
              imageUrl: faker.image.urlLoremFlickr({ category: 'product' }),
            })),
          },
          variants: {
            create: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => ({
              sku: faker.string.alphanumeric(8).toUpperCase(),
              options: {
                color: faker.color.human(),
                size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
              },
              price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
            })),
          },
        },
      });
    }),
  );

  return products;
}

async function seedUsers(count: number, roles: any[]) {
  console.log('👥 Seeding users...');

  return Promise.all(
    Array.from({ length: count }).map(async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      return prisma.user.create({
        data: {
          email: faker.internet.email({ firstName, lastName }),
          password: await bcrypt.hash('Password@123', SALT_ROUNDS),
          firstName,
          lastName,
          telephone: faker.phone.number(),
          isVerified: faker.datatype.boolean(),
          profilePicture: faker.image.avatar(),
          lastLogin: faker.date.recent(),
          roles: {
            create: {
              roleId: faker.helpers.arrayElement(roles.filter((r) => r.name !== UserRoleType.ADMIN))
                .id,
            },
          },
          addresses: {
            create: Array.from({ length: faker.number.int({ min: 1, max: 2 }) }).map(() => ({
              addressLine1: faker.location.streetAddress(),
              addressLine2: faker.location.secondaryAddress(),
              city: faker.location.city(),
              postalCode: faker.location.zipCode(),
              country: faker.location.countryCode(),
              telephone: faker.phone.number(),
              addressType: faker.helpers.arrayElement(['SHIPPING', 'BILLING']),
            })),
          },
          payments: {
            create: {
              paymentType: faker.helpers.arrayElement(Object.values(PaymentType)),
              provider: faker.helpers.arrayElement(['VISA', 'MasterCard', 'PayPal']),
              accountNo: faker.finance.creditCardNumber(),
              expiryMonth: faker.number.int({ min: 1, max: 12 }),
              expiryYear: faker.number.int({ min: 2024, max: 2030 }),
              isPrimary: true,
            },
          },
        },
      });
    }),
  );
}

async function seedOrders(users: any[], products: any[]) {
  console.log('🛍️ Seeding orders...');

  for (const user of users) {
    const orderCount = faker.number.int({ min: 0, max: 3 });

    for (let i = 0; i < orderCount; i++) {
      const orderItems = faker.helpers
        .arrayElements(products, faker.number.int({ min: 1, max: 4 }))
        .map((product) => ({
          productId: product.id,
          quantity: faker.number.int({ min: 1, max: 5 }),
          priceAtPurchase: product.price,
        }));

      const subtotal = orderItems.reduce(
        (sum, item) => sum + Number(item.priceAtPurchase) * item.quantity,
        0,
      );
      const shippingCost = faker.number.float({ min: 5, max: 15, fractionDigits: 2 });
      const taxAmount = subtotal * 0.1; // 10% tax
      const total = subtotal + shippingCost + taxAmount;

      const address = {
        addressLine1: faker.location.streetAddress(),
        addressLine2: faker.location.secondaryAddress(),
        city: faker.location.city(),
        postalCode: faker.location.zipCode(),
        country: faker.location.countryCode(),
        telephone: faker.phone.number(),
      };

      await prisma.orderDetails.create({
        data: {
          userId: user.id,
          status: faker.helpers.arrayElement(Object.values(OrderStatus)),
          total,
          subtotal,
          taxAmount,
          shippingCost,
          currency: 'USD',
          trackingNumber: faker.string.alphanumeric(12).toUpperCase(),
          estimatedDelivery: faker.date.future(),
          shippingAddress: address,
          billingAddress: address,
          orderItems: {
            create: orderItems,
          },
          paymentDetails: {
            create: {
              amount: total,
              provider: 'Stripe',
              status: faker.helpers.arrayElement(Object.values(PaymentStatus)),
              transactionId: faker.string.uuid(),
            },
          },
        },
      });
    }
  }
}

async function main() {
  try {
    await clearDatabase();
    const { roles, adminUser } = await seedBaseData();
    const products = await seedProducts(20);
    const users = await seedUsers(10, roles);
    await seedOrders([adminUser, ...users], products);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
