import { Router } from 'express';
import authController from './auth.controller';
import prisma from '@config/prisma';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Message from auth route',
  });
});

router.post('/register', authController.register);

// GET /auth/verify?token=xyz
router.get('/verify', authController.verify);

// POST /auth/resend-verification

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
router.post('/resend-verification', authController.resendVerification);

export default router;
