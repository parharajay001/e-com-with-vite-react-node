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

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  // Clean existing data
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.paymentDetails.deleteMany(),
    prisma.orderItems.deleteMany(),
    prisma.orderDetails.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.shoppingSession.deleteMany(),
    prisma.wishlist.deleteMany(),
    prisma.userPayment.deleteMany(),
    prisma.userAddress.deleteMany(),
    prisma.userRole.deleteMany(),
    prisma.user.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.discount.deleteMany(),
    prisma.productInventory.deleteMany(),
    prisma.productCategory.deleteMany(),
    prisma.role.deleteMany(),
    prisma.tax.deleteMany(),
  ]);

  // ========== SEED ROLES ==========
  const rolePromises = Object.values(UserRoleType).map((name) =>
    prisma.role.create({
      data: {
        name,
        description: `${name} role`,
      },
    }),
  );
  const roles = await Promise.all(rolePromises);
  const roleIds = roles.map((role) => role.id);

  // ========== SEED TAXES ==========
  await prisma.tax.createMany({
    data: [
      { country: 'US', state: 'CA', rate: 9.5 },
      { country: 'DE', rate: 19.0 },
      { country: 'FR', rate: 20.0 },
    ],
  });

  // ========== SEED CATEGORIES ==========
  const categoryPromises = Array.from({ length: 5 }).map(() =>
    prisma.productCategory.create({
      data: {
        name: faker.commerce.department(),
        description: faker.commerce.productDescription(),
        createdAt: faker.date.past(),
      },
    }),
  );
  const categories = await Promise.all(categoryPromises);
  const categoryIds = categories.map((cat) => cat.id);

  // ========== SEED INVENTORIES ==========
  const inventoryPromises = Array.from({ length: 10 }).map(() =>
    prisma.productInventory.create({
      data: {
        quantity: faker.number.int({ min: 10, max: 1000 }),
        lowStockThreshold: faker.number.int({ min: 5, max: 20 }),
      },
    }),
  );
  const inventories = await Promise.all(inventoryPromises);
  const inventoryIds = inventories.map((inv) => inv.id);

  // ========== SEED DISCOUNTS ==========
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const discounts = await prisma.discount.createMany({
    data: Array.from({ length: 3 }).map(() => ({
      name: `${faker.commerce.productAdjective()} Sale`,
      discountPercent: faker.number.float({ min: 5, max: 50, fractionDigits: 2 }),
      description: faker.commerce.productDescription(),
      active: faker.datatype.boolean(),
    })),
  });

  // ========== SEED PRODUCTS ==========
  const activeDiscounts = await prisma.discount.findMany({
    where: { active: true },
    select: { id: true },
  });

  const productPromises = Array.from({ length: 20 }).map(async () => {
    const inventoryId = faker.helpers.arrayElement(inventoryIds);

    return prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        SKU: faker.string.uuid().substring(0, 8).toUpperCase(),
        description: faker.commerce.productDescription(),
        categoryId: faker.helpers.arrayElement(categoryIds),
        inventoryId,
        price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
        discountId:
          activeDiscounts.length > 0 ? faker.helpers.arrayElement(activeDiscounts).id : null,
        variants: {
          create: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => ({
            sku: faker.string.uuid().substring(0, 8).toUpperCase(),
            options: {
              color: faker.color.human(),
              size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
              material: faker.commerce.productMaterial(),
            },
            price: faker.number.float({ min: 5, max: 500, fractionDigits: 2 }),
          })),
        },
        productImage: {
          create: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => ({
            imageUrl: faker.image.urlLoremFlickr({ category: 'product' }),
          })),
        },
      },
    });
  });

  const products = await Promise.all(productPromises);

  // ========== SEED USERS ==========
  const userPromises = Array.from({ length: 10 }).map(async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }),
        password: await bcrypt.hash(`${firstName}@123`, SALT_ROUNDS),
        firstName,
        lastName,
        telephone: faker.phone.number(),
        isVerified: faker.datatype.boolean(),
        profilePicture: faker.image.avatar(),
        lastLogin: faker.date.recent(),
        addresses: {
          create: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => ({
            addressLine1: faker.location.streetAddress(),
            addressLine2: faker.datatype.boolean() ? faker.location.secondaryAddress() : null,
            city: faker.location.city(),
            postalCode: faker.location.zipCode(),
            country: faker.location.countryCode(),
            addressType: faker.helpers.arrayElement(['SHIPPING', 'BILLING']),
          })),
        },
        payments: {
          create: Array.from({ length: faker.number.int({ min: 1, max: 2 }) }).map(() => ({
            paymentType: faker.helpers.arrayElement(Object.values(PaymentType)),
            provider: faker.helpers.arrayElement(['VISA', 'MasterCard', 'PayPal', 'Stripe']),
            accountNo: faker.finance.creditCardNumber(),
            expiryMonth: faker.number.int({ min: 1, max: 12 }),
            expiryYear: faker.number.int({ min: 2024, max: 2030 }),
            isPrimary: faker.datatype.boolean(),
          })),
        },
        roles: {
          create: {
            roleId: faker.helpers.arrayElement(roleIds),
          },
        },
      },
    });
  });

  const users = await Promise.all(userPromises);

  // ========== SEED ORDERS ==========
  const orderPromises = Array.from({ length: 15 }).map(async () => {
    const user = faker.helpers.arrayElement(users);

    const order = await prisma.orderDetails.create({
      data: {
        user: { connect: { id: user.id } },
        total: 0,
        status: faker.helpers.arrayElement(Object.values(OrderStatus)),
        currency: 'USD',
        paymentDetails: {
          create: {
            amount: 0,
            provider: faker.helpers.arrayElement(['Stripe', 'PayPal', 'Bank Transfer']),
            status: faker.helpers.arrayElement(Object.values(PaymentStatus)),
            transactionId: faker.string.uuid(),
          },
        },
        orderItems: {
          create: await Promise.all(
            Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(async () => {
              const product = faker.helpers.arrayElement(products);
              const quantity = faker.number.int({ min: 1, max: 5 });

              // Update inventory
              await prisma.productInventory.update({
                where: { id: product.inventoryId },
                data: { quantity: { decrement: quantity } },
              });

              return {
                product: { connect: { id: product.id } },
                quantity,
                priceAtPurchase: product.price,
              };
            }),
          ),
        },
      },
      include: { orderItems: true },
    });

    // Calculate total
    const total = order.orderItems.reduce(
      (sum, item) => sum + Number(item.priceAtPurchase) * item.quantity,
      0,
    );

    // Update order and payment details
    await prisma.$transaction([
      prisma.orderDetails.update({
        where: { id: order.id },
        data: { total },
      }),
      prisma.paymentDetails.update({
        where: { orderId: order.id },
        data: { amount: total },
      }),
    ]);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityId: order.id,
        entityType: 'Order',
        action: 'CREATE',
        userId: user.id,
        newValue: order as any,
      },
    });

    return order;
  });

  const orders = await Promise.all(orderPromises);

  // ========== SEED WISHLISTS ==========
  const wishlistPromises = users.map(async (user) => {
    const productIds = faker.helpers
      .arrayElements(products, faker.number.int({ min: 1, max: 5 }))
      .map((p) => p.id);

    return prisma.wishlist.create({
      data: {
        userId: user.id,
        products: {
          connect: productIds.map((id) => ({ id })),
        },
      },
    });
  });

  await Promise.all(wishlistPromises);

  console.log('Database seeded successfully!');
  console.log(`-> ${products.length} products created`);
  console.log(`-> ${users.length} users created`);
  console.log(`-> ${orders.length} orders created`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
