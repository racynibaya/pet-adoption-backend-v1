import { NextFunction, Request, Response } from 'express';

import * as z from 'zod';

import authService from './auth-service';

import jwt, { JwtPayload } from 'jsonwebtoken';

const User = z.object({
  email: z.email(),
  name: z.string().min(5),
  password: z.string(),
});

const LoginSchema = User.omit({ name: true });

import { EmailInput } from './auth-types';
import { UnauthorizedError } from '@utils/error';
import prisma from '@config/prisma';

export type UserT = z.infer<typeof User>;

class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = LoginSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({ message: parsed.error });
        return;
      }
      const { email, password } = parsed.data;

      console.log(email, password);

      const tokens = await authService.authenticateUser(email, password);

      if (!tokens) {
        res
          .status(401)
          .json({ success: false, message: 'Invalid credentials' });
        return;
      }

      const { accessToken, refreshToken } = tokens;

      await prisma.user.update({
        where: { email },
        data: { refreshToken },
      });

      res
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        })
        .json({
          success: true,
          message: 'Succesfully Logged in',
          accessToken,
          refreshToken, //TODO: REMOVE IT IN PRODUCTION
        });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.cookies.refreshToken;

    try {
      if (refreshToken) await authService.clearRefreshToken(refreshToken);

      res
        .clearCookie('refreshToken', { path: '/api/v1/auth' })
        .status(200)
        .json({
          success: true,
          message: 'User logged out successfully',
        });
    } catch (error) {
      next(error);
    }
  }

  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name, email, password } = User.parse(req.body);

      const existingUser = await authService.isExistingEmail(email);

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Email already in use',
        });
        return;
      }

      // createUser
      // remove token when deploying
      const { verifyToken: token, ...user } = await authService.createUser({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        link: user.link,
        message:
          'Registration successful, please check your email to verify your account',

        ...(process.env.NODE_ENV === 'development' && { token }), // dev only
      });
    } catch (error) {
      next(error);
    }
  }

  async oneTimeEmailVerification(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const token = req.query.token;

      if (typeof token !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Verification token is invalid',
        });
        return;
      }
      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Verification token is missing',
        });
        return;
      }

      const record = await authService.findUserViaToken(token);

      if (!record) {
        res.status(400).json({
          success: false,
          message: 'Invalid verification token',
        });
        return;
      }

      if (!record.verifyTokenExpiry || record.verifyTokenExpiry < new Date()) {
        res.status(400).json({
          success: false,
          message: 'Verification token has expired, please request a new one',
        });
        return;
      }

      await authService.oneTimeVerificationUpdate(record);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully, you can now login',
      });
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = EmailInput.parse(req.body);

      const user = await authService.isExistingEmail(email);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User dont exist',
        });
        return;
      }

      if (user.isVerified) {
        res.status(400).json({
          success: false,
          message: 'User is already verified',
        });
        return;
      }

      await authService.verifyUserViaEmail(email);

      res.status(200).json({
        success: true,
        message: 'Verification email sent',
      });
    } catch (error) {
      next(error);
    }
  }

  // it handles when toekn is expired
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken; // from httpOnly cookie

      if (!refreshToken) {
        throw new UnauthorizedError(
          'Refresh token has expired, please login again',
        );
      }

      const accessToken = await authService.refreshAccessToken(refreshToken);

      res.json({ success: true, accessToken }); // ✅ send new accessToken
    } catch (error) {
      next(error);
    }
  }

  test(req: Request, res: Response, next: NextFunction) {
    res.json({
      message: 'This is the admin',
    });
  }
}

export default new AuthController();
