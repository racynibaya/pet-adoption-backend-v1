import crypto from 'node:crypto';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import prisma from '@config/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '@utils/error';

import { User } from '../../../generated/prisma/client';
import { JwtPayload, CreateUserDTO, SanitizedUser } from './auth-types';

const { TokenExpiredError, JsonWebTokenError } = jwt;

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
const ONE_HOUR_MS = 60 * 60 * 1000;

class AuthService {
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async authenticateUser(
    email: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: SanitizedUser;
  }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new NotFoundError('Invalid credentials');

    const isPasswordMatched = await bcrypt.compare(
      password,
      user.hashedPassword,
    );

    if (!isPasswordMatched) throw new UnauthorizedError('Invalid credentials');

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: 15 * 60,
      },
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      {
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken, user };
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

  async clearRefreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (user) {
        await prisma.user.update({
          where: { email: user.email },
          data: { refreshToken: null },
        });
      }
    } catch (error) {}
  }

  async createUser(
    data: CreateUserDTO,
  ): Promise<SanitizedUser & { link: string }> {
    const { firstName, lastName, email, password } = data;
    const token = crypto.randomBytes(32).toString('hex');
    const hashed = await bcrypt.hash(password, 10);
    try {
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          hashedPassword: hashed,
          isVerified: true, //TODO: set to false kapag meron na ung email feature
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

  async reverificationEmail(
    staleToken: string | null,
  ): Promise<{ token: string; link: string }> {
    const token = crypto.randomBytes(32).toString('hex');

    const link = `${process.env.BASE_URL}/auth/verify?token=${token}`;

    if (!staleToken)
      throw new BadRequestError(
        'No existing verification token found, please register again',
      );

    const user = await prisma.user.findFirst({
      where: { verifyToken: staleToken },
    });

    if (!user)
      throw new NotFoundError(
        'No user found for this verification token, please register again',
      );

    await prisma.user.update({
      where: { email: user.email },
      data: {
        verifyToken: token,
        verifyTokenExpiry: new Date(Date.now() + ONE_HOUR_MS), //1hr
      },
    });

    return { token, link };
  }

  async refreshAccessToken(
    token: string,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const accessToken = jwt.sign(
        { id: decoded.id, role: decoded.role, email: decoded.email },
        JWT_SECRET,
        { expiresIn: 15 * 60 },
      );

      const newRefreshToken = jwt.sign(
        { id: decoded.id, role: decoded.role, email: decoded.email },
        JWT_SECRET,
        { expiresIn: '7d' },
      );

      await prisma.user.update({
        where: { id: decoded.id },
        data: { refreshToken: newRefreshToken },
      });

      return { accessToken, newRefreshToken };
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
