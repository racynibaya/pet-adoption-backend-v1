import { Router } from 'express';
import authController from './auth-controller';
import prisma from '@config/prisma';
import { authMiddleWare } from './auth-middleware';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Message from auth route',
  });
});

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/register', authController.register);

router.get('/admin', authMiddleWare, authController.test);
router.get('/refresh', authController.refresh);

// GET /auth/verify?token=xyz
router.get('/verify', authController.oneTimeEmailVerification);

router.post('/resend-verification', authController.resendVerification);

export default router;
