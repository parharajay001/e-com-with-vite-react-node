import { faker } from '@faker-js/faker';
import { Role, UserRoleType } from '@prisma/client';
import { expect } from 'chai';
import request from 'supertest';
import { prisma } from '../config/prisma';
import { app } from '../index';
import { AuthResponse } from '../types/auth.types';

describe('Authentication System', () => {
  const createTestUser = () => ({
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    telephone: faker.phone.number(),
  });

  const testUser = createTestUser();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let adminRole: Role;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userRole: Role;

  before(async () => {
    // Setup required roles
    [adminRole, userRole] = await Promise.all([
      prisma.role.upsert({
        where: { name: UserRoleType.ADMIN },
        update: {},
        create: { name: UserRoleType.ADMIN, description: 'Administrator' },
      }),
      prisma.role.upsert({
        where: { name: UserRoleType.USER },
        update: {},
        create: { name: UserRoleType.USER, description: 'Regular User' },
      }),
    ]);
  });

  beforeEach(async () => {
    await prisma.$transaction([
      // Delete related records first
      prisma.userRole.deleteMany({ where: { user: { email: testUser.email } } }),
      prisma.userAddress.deleteMany({ where: { user: { email: testUser.email } } }),
      prisma.userPayment.deleteMany({ where: { user: { email: testUser.email } } }),
      prisma.shoppingSession.deleteMany({ where: { user: { email: testUser.email } } }),
      // Then delete the user
      prisma.user.deleteMany({ where: { email: testUser.email } }),
    ]);
  });

  afterEach(async () => {
    await prisma.$transaction([
      prisma.userRole.deleteMany({ where: { user: { email: testUser.email } } }),
      prisma.userAddress.deleteMany({ where: { user: { email: testUser.email } } }),
      prisma.userPayment.deleteMany({ where: { user: { email: testUser.email } } }),
      prisma.shoppingSession.deleteMany({ where: { user: { email: testUser.email } } }),
      prisma.user.deleteMany({ where: { email: testUser.email } }),
    ]);
  });

  describe('User Registration', () => {
    it('should successfully register a user with valid data', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser).expect(201);
      const body = res.body as AuthResponse;

      // Validate response structure
      expect(body.token).to.be.a('string');
      expect(body.user).to.contain({
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
      });
      expect(body.user).to.not.have.property('password');

      // Verify database state
      const dbUser = await prisma.user.findUnique({
        where: { email: testUser.email },
        include: { roles: { include: { role: true } } },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(dbUser).to.exist;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(dbUser?.isVerified).to.be.false;
      expect(dbUser?.roles).to.satisfy((roles: any[]) =>
        roles.some((r) => r.role.name === UserRoleType.USER),
      );
    });

    it('should handle optional fields correctly', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          firstName: testUser.firstName,
        })
        .expect(201);

      const body = res.body;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(body.user.lastName).to.be.null;
    });

    it('should enforce unique email constraint', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app).post('/api/auth/register').send(testUser).expect(400);

      expect(res.body.error).to.match(/already exists/i);
    });

    // it('should validate password complexity', async () => {
    //   const res = await request(app)
    //     .post('/api/auth/register')
    //     .send({
    //       ...testUser,
    //       password: 'weak',
    //     })
    //     .expect(400);

    //   expect(res.body.error).to.match(/password requirements/i);
    // });
  });

  // describe('User Login', () => {
  //   beforeEach(async () => {
  //     await request(app).post('/api/auth/register').send(testUser);
  //   });

  //   it('should authenticate valid credentials', async () => {
  //     const res = await request(app)
  //       .post('/api/auth/login')
  //       .send({
  //         email: testUser.email,
  //         password: testUser.password,
  //       })
  //       .expect(200);

  //     const body = res.body as AuthResponse;
  //     const decoded = jwt.verify(body.token, process.env.JWT_SECRET!) as { userId: number };

  //     expect(decoded.userId).to.equal(body.user.id);
  //     expect(body.user).to.contain({
  //       email: testUser.email,
  //       firstName: testUser.firstName,
  //     });
  //   });

  //   it('should update last login timestamp', async () => {
  //     await request(app).post('/api/auth/login').send({
  //       email: testUser.email,
  //       password: testUser.password,
  //     });

  //     const dbUser = await prisma.user.findUnique({
  //       where: { email: testUser.email },
  //     });

  //     expect(dbUser?.lastLogin).to.be.a('Date');
  //   });

  //   it('should handle account lockout after multiple failures', async () => {
  //     const MAX_ATTEMPTS = 5;

  //     for (let i = 0; i < MAX_ATTEMPTS; i++) {
  //       await request(app)
  //         .post('/api/auth/login')
  //         .send({ ...testUser, password: 'wrong' })
  //         .expect(401);
  //     }

  //     // Verify account is locked
  //     const res = await request(app).post('/api/auth/login').send(testUser).expect(403);

  //     expect(res.body.error).to.match(/account locked/i);
  //     const dbUser = await prisma.user.findUnique({ where: { email: testUser.email } });
  //     expect(dbUser?.accountLocked).to.be.true;
  //   });
  // });

  // describe('Token Verification', () => {
  //   let validToken: string;

  //   beforeEach(async () => {
  //     const res = await request(app).post('/api/auth/register').send(testUser);
  //     validToken = res.body.token;
  //   });

  //   it('should validate JWT tokens', async () => {
  //     const res = await request(app).get('/api/users').set('Authorization', `Bearer ${validToken}`).expect(200);

  //     expect(res.body.userId).to.exist;
  //   });

  //   it('should handle expired tokens', async () => {
  //     const expiredToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!, { expiresIn: '-1s' });

  //     const res = await request(app).get('/api/users').set('Authorization', `Bearer ${expiredToken}`).expect(401);

  //     expect(res.body.error).to.match(/expired/i);
  //   });

  //   it('should include role information', async () => {
  //     // Grant admin role
  //     const user = await prisma.user.findUnique({ where: { email: testUser.email } });
  //     await prisma.userRole.create({
  //       data: {
  //         userId: user!.id,
  //         roleId: adminRole.id,
  //       },
  //     });

  //     const res = await request(app).get('/api/users').set('Authorization', `Bearer ${validToken}`);

  //     expect(res.body.user.roles).to.include(UserRoleType.ADMIN);
  //   });
  // });

  // describe('Security Measures', () => {
  //   it('should not expose sensitive fields in responses', async () => {
  //     const res = await request(app).post('/api/auth/register').send(testUser);

  //     const body = res.body as AuthResponse;
  //     expect(body.user).to.not.have.property('password');
  //     expect(body.user).to.not.have.property('otp');
  //     expect(body.user).to.not.have.property('accountLocked');
  //   });

  //   it('should hash passwords in database', async () => {
  //     await request(app).post('/api/auth/register').send(testUser);

  //     const dbUser = await prisma.user.findUnique({
  //       where: { email: testUser.email },
  //     });

  //     expect(dbUser?.password).to.not.equal(testUser.password);
  //     expect(dbUser?.password).to.match(/^\$2[aby]\$\d+\$/); // bcrypt pattern
  //   });
  // });
});
