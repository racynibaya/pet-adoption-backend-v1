import { Router } from 'express';
import authController from './auth-controller';

import {
  verifyTokenMiddleware,
  checkVerifiedUser,
  authorizeRole,
} from '../../middlewares/auth-middleware';

const router = Router();

router
  .route('/')
  .get((req, res) => {
    res.json({
      message: 'Message from auth route',
    });
  })
  .post((req, res) => {
    res.json({ message: 'POST request to auth route' });
  });

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/register', authController.register);

router.get(
  '/admin',
  verifyTokenMiddleware,
  checkVerifiedUser,
  authorizeRole('ADMIN'),
  authController.test,
);
router.get('/refresh', authController.refresh);

// GET /auth/verify?token=xyz
router.get('/verify', authController.oneTimeEmailVerification);

router.post('/resend-verification', authController.resendVerification);

export default router;
