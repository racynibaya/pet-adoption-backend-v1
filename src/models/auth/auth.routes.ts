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

router.post('/resend-verification', authController.resendVerification);

export default router;
