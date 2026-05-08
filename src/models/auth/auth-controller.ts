import { NextFunction, Request, Response } from 'express';

import prisma from '@config/prisma';

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '@utils/error';

import authService from './auth-service';
import { UserT, LoginSchema, EmailInput } from './auth-types';

class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = LoginSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({ message: parsed.error });
        return;
      }
      const { email, password } = parsed.data;

      const user = await authService.isExistingEmail(email);

      if (!user) throw new UnauthorizedError('Invalid credentials');

      if (!user.isVerified) {
        throw new ForbiddenError(
          'Email not verified, please verify your email before logging in',
        );
      }

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
      const { name, email, password, role } = UserT.parse(req.body);

      const existingUser = await authService.isExistingEmail(email);

      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // createUser
      // remove token when deploying
      const { verifyToken: token, ...user } = await authService.createUser({
        name,
        email,
        password,
        role,
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

      console.log(token, 'LINE 136');

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

      if (!user) throw new NotFoundError('User with this email does not exist');

      if (user.isVerified)
        throw new BadRequestError('User is already verified');

      const { link, token } = await authService.reverificationEmail(
        user.verifyToken,
      );

      res.status(200).json({
        token,
        link,
        success: true,
        message: 'Verification link sent',
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
    console.log(req.user);

    res.json({
      message: 'This is the admin',
    });
  }
}

export default new AuthController();
