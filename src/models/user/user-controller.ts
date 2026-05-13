import { Request, Response, NextFunction } from 'express';

import prisma from '@config/prisma';
import userServices from './user-service';

class UserController {
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = req.user!;

      const user = await userServices.getCurrentUser(currentUser.id);

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
