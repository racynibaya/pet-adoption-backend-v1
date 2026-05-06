import { Router, Request, Response } from 'express';

import prisma from '@config/prisma';
import {
  authorizeRole,
  checkVerifiedUser,
  verifyTokenMiddleware,
} from 'middlewares/auth-middleware';

const router = Router();

router.get('/', async (req, res) => {
  const shelters = await prisma.shelter.findMany();
  res.json({
    message: 'Message from shelter route',
    data: shelters,
  });
});

router.post(
  '/',
  verifyTokenMiddleware,
  checkVerifiedUser,
  authorizeRole('ADMIN'),
  async (req: Request, res: Response) => {
    const shelters = await prisma.shelter.findMany();
    res.json({
      message: 'YOURE AN ADMIN AND CAN DELETE SHELTERS',
      data: shelters,
    });
  },
);

export default router;
