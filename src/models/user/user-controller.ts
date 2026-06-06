import { Request, Response, NextFunction } from 'express';

import userServices from './user-service';
import { ForbiddenError } from '@utils/error';

class UserController {
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = req.user;

      if (!currentUser) {
        throw new ForbiddenError('You dont have access to this route');
      }

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
