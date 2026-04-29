import crypto from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

import * as z from 'zod';
import bcrypt from 'bcrypt';

import authService from './auth.service';

const User = z.object({
  email: z.email(),
  name: z.string().min(5),
  password: z.string(),
});

import prisma from '@config/prisma';
import { EmailInput } from './auth.types';

// 1. receive { name, email, password }
// 2. validate inputs
// 3. check if email already exists → 409 if yes
// 4. hash the password
// 5. save user to db { isVerified: false }
// 6. generate a random token
// 7. save token to db { userId, token, expiresAt }
// 8. send verification email with the token link
// 9. return 201 { message: "check your email" }

export type UserT = z.infer<typeof User>;

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = User.parse(req.body);

      const existingUser = await authService.existingEmail(email);

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use',
        });
      }

      const hashed = await bcrypt.hash(password, 10);

      const token = crypto.randomBytes(32).toString('hex');

      // createUser
      await authService.createUser({ name, email, hashed, token });

      const link = `${process.env.BASE_URL}/auth/verify?token=${token}`;

      console.log(link);

      res.status(201).json({
        success: true,
        message:
          'Registration successful, please check your email to verify your account',
        ...(process.env.NODE_ENV === 'development' && { token }), // dev only
      });
    } catch (error) {
      next(error);
    }
  }

  async verify(req: Request, res: Response) {
    const token = req.query.token as string;

    const record = await authService.findUserViaToken(token);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is missing',
      });
    }

    if (!record)
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
      });

    if (record.verifyTokenExpiry < new Date())
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired, please request a new one',
      });

    await authService.updateVerification(record);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully, you can now login',
    });
  }

  //   POST /auth/resend-verification

  // 1. receive { email }
  // 2. find user by email → 404 if not found
  // 3. check if already verified → 400 if yes
  // 4. generate new token
  // 5. update user {
  //      verifyToken: newToken,
  //      verifyTokenExpiry: now + 1 hour
  //    }
  // 6. send new verification email
  // 7. return 200 { message: "verification email resent" }

  async resendVerification(req: Request, res: Response) {
    const { email } = EmailInput.parse(req.body);

    const user = await authService.existingEmail(email);

    if (!user)
      return res.status(404).json({
        success: false,
        message: 'User dont exist',
      });

    if (user.isVerified) {
      return res.status(400).json({
        success: 'false',
        message: 'User is already verified',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { email },
      data: {
        verifyToken: token,
        verifyTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const link = `${process.env.BASE_URL}/auth/verify?token=${token}`;

    console.log(link);

    res.status(200).json({
      success: true,
      message: 'Verification email sent',
    });
  }
}

export default new AuthController();
