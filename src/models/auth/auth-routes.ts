import { Router } from 'express';

import authController from './auth-controller';
import {
  verifyTokenMiddleware,
  checkVerifiedUser,
  authorizeRole,
} from './auth-middleware';
import { validate } from '@middlewares';

import { emailInput, loginSchema, userSchema } from './auth-types';

const router = Router();

router
  .route('/')
  .get(
    verifyTokenMiddleware,
    checkVerifiedUser,
    authorizeRole('ADMIN'),
    (req, res) => {
      res.json({
        message: 'Message from auth route',
      });
    },
  )
  .post((req, res) => {
    res.json({ message: 'POST request to auth route' });
  });

router.post('/login', validate(loginSchema, 'body'), (req, res, next) =>
  authController.login(req, res, next),
);

router.post('/logout', (req, res, next) =>
  authController.logout(req, res, next),
);

router.post('/register', validate(userSchema, 'body'), (req, res, next) =>
  authController.register(req, res, next),
);

router.get(
  '/admin',
  verifyTokenMiddleware,
  checkVerifiedUser,
  authorizeRole('ADMIN'),
  (req, res, _next) => authController.test(req, res),
);

router.get('/refresh', (req, res, next) =>
  authController.refresh(req, res, next),
);

// GET /auth/verify?token=xyz
router.get('/verify', (req, res, next) =>
  authController.oneTimeEmailVerification(req, res, next),
);

router.post(
  '/resend-verification',
  validate(emailInput, 'body'),
  (req, res, next) => authController.resendVerification(req, res, next),
);

export default router;
