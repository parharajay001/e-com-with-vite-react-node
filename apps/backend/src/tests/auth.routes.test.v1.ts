import { faker } from '@faker-js/faker';
import { expect } from 'chai';
import request from 'supertest';
import { prisma } from '../config/prisma';
import { app } from '../index';

describe('Authentication Routes', () => {
  const testUser = {
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };

  before(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  after(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('token');
      expect(res.body.token).to.be.a('string');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('id');
      expect(res.body.user.email).to.equal(testUser.email);
    });

    it('should reject duplicate registration', async () => {
      // Create user first
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Register first
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app).post('/api/auth/login').send(testUser);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body.token).to.be.a('string');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('id');
      expect(res.body.user.email).to.equal(testUser.email);
    });

    it('should reject invalid credentials', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.equal('Invalid credentials');
    });
  });
});
