import { Request, Response, NextFunction } from 'express';

import prisma from '@config/prisma';

import shelterService from './shelter-service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { BadRequestError, ConflictError, NotFoundError } from '@utils/error';

class ShelterController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, address, contactEmail, phoneNumber, ownerId } =
        shelterService.validateShelterData(req.body);

      const shelter = await prisma.shelter.create({
        data: {
          name,
          description,
          address,
          contactEmail,
          phoneNumber,
          ownerId,
        },
      });

      res.json({
        message: 'YOURE AN ADMIN AND CAN ADD NEW SHELTERS',
        data: shelter,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return next(
          new ConflictError('Shelter with this address already exists'),
        );
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const shelterId = Number(req.params.id);

    console.log(shelterId, 'LINE 69');

    try {
      if (isNaN(shelterId)) {
        throw new BadRequestError('Invalid shelter ID');
      }

      const shelter = await prisma.shelter.findUnique({
        where: { id: shelterId },
      });

      if (!shelter) throw new NotFoundError('Shelter not found');

      const deletedShelter = await prisma.shelter.delete({
        where: { id: shelterId },
      });

      res.json({
        message: `SHELTER WITH ID ${shelterId} DELETED`,
        data: deletedShelter,
      });
    } catch (error) {
      next(error);
    }
  }

  async getShelters(req: Request, res: Response) {
    const shelters = await prisma.shelter.findMany();
    res.json({
      message: 'Message from shelter route',
      data: shelters,
    });
  }
}

export default new ShelterController();
