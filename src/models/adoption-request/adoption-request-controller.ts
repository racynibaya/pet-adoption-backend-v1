import { Request, Response, NextFunction } from 'express';

import { CreateAdoptionRequestDTO } from './adoption-request-types';
import { UnauthorizedError } from '@utils/error';

import adoptionRequestService from './adoption-request-service';

class AdoptionRequestController {
  async adoption(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError('Unauthorized');

      const request = await adoptionRequestService.createRequest(
        req.user.id,
        req.body as CreateAdoptionRequestDTO,
      );

      res.status(201).json({
        success: true,
        message: 'Adoption request created successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdoptionRequestController();
