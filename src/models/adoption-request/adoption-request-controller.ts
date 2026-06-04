import { Request, Response, NextFunction } from 'express';

import { ZodError } from 'zod';
import {
  CreateAdoptionRequestDTO,
  adoptionRequestSchema,
} from './adoption-request.types';
import { BadRequestError } from '@utils/error';

import adoptionRequestService from './adoption-request-service';

class AdoptionRequestController {
  async adoption(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateAdoptionRequestDTO = adoptionRequestSchema.parse(
        req.body,
      );

      console.log(data);

      const request = await adoptionRequestService.createRequest(
        req.user!.id,
        data,
      );

      res.status(201).json({
        success: true,
        message: 'Adoption already filed',
        data: request,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new BadRequestError(error.issues[0].message));
      }

      next(error);
    }
  }
}

export default new AdoptionRequestController();
