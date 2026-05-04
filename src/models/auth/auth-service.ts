import crypto from 'node:crypto';

import bcrypt from 'bcrypt';
import prisma from '@config/prisma';
import jwt from 'jsonwebtoken';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

import { User } from '../../../generated/prisma/client';
import { JwtPayload, CreateUserDTO, SanitizedUser } from './auth-types';
import { BadRequestError, UnauthorizedError } from '@utils/error';

const { TokenExpiredError, JsonWebTokenError } = jwt;

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ONE_HOUR_MS = 60 * 60 * 1000;

class AuthService {
  async isExistingEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async authenticateUser(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid Credentials');
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      user.hashedPassword,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedError('Invalid Credentials');
    }

    const accessToken = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });
    const refreshToken = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedError('Access token has expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedError('Invalid access token');
      }
      throw error;
    }
  }

  async createUser(
    data: CreateUserDTO,
  ): Promise<SanitizedUser & { link: string }> {
    const { name, email, password } = data;
    const token = crypto.randomBytes(32).toString('hex');
    const hashed = await bcrypt.hash(password, 10);
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          hashedPassword: hashed,
          isVerified: false,
          verifyToken: token,
          verifyTokenExpiry: new Date(Date.now() + ONE_HOUR_MS), //1hr
        },
        omit: {
          verifyTokenExpiry: true,
          hashedPassword: true,
        },
      });

      const link = `${process.env.BASE_URL}/auth/verify?token=${token}`;

      return { link, ...user };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestError('Email already exists'); // ✅ specific
        }
      }
      throw error; // ✅ bubble up real error to global handler
    }
  }

  async findUserViaToken(token: string) {
    const user = await prisma.user.findFirst({
      where: { verifyToken: token },
    });

    return user;
  }

  async oneTimeVerificationUpdate(record: User): Promise<void> {
    await prisma.user.update({
      where: { email: record.email },
      data: {
        isVerified: true,
      },
    });
  }

  async verifyUserViaEmail(email: string): Promise<SanitizedUser> {
    const token = crypto.randomBytes(32).toString('hex');

    const link = `${process.env.BASE_URL}/auth/verify?token=${token}`;

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        verifyToken: token,
        verifyTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
      omit: {
        verifyTokenExpiry: true,
      },
    });

    return { link, ...updatedUser };
  }

  async refreshAccessToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      const accessToken = jwt.sign({ email: decoded.email }, JWT_SECRET, {
        expiresIn: '1h',
      });

      return accessToken;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedError(
          'Refresh token has expired, please login again',
        );
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }
}

export default new AuthService();
