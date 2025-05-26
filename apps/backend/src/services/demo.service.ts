import { UserRoleType } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/envConfig';
import { prisma } from '../config/prisma';
import { JwtPayload, LoginRequest, RegisterRequest } from '../types/auth.types';

export class AuthService {
  private static SALT_ROUNDS = 10;

  static async register(data: RegisterRequest) {
    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        roles: {
          create: {
            role: {
              connect: {
                name: UserRoleType.USER,
              },
            },
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
    };

    const token = jwt.sign(payload, envConfig.auth.jwtSecret, { expiresIn: '24h' });

    return { user, token };
  }

  static async login(data: LoginRequest) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
    };

    const token = jwt.sign(payload, envConfig.auth.jwtSecret, { expiresIn: '24h' });

    return { user, token };
  }
}
