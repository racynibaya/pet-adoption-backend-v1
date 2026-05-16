import path from 'node:path';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

import prisma from '@config/prisma';
import { BadRequestError, ForbiddenError } from '@utils/error';

import { Role } from '../../../generated/prisma/client';
import { CreatePetDTO } from './pet-types';

class PetService {
  async getAllPets(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [pets, total] = await prisma.$transaction([
      prisma.pet.findMany({
        where: {
          status: {
            not: 'ADOPTED',
          },
        },
        include: {
          images: true,
        },
        skip,
        take: limit,
      }),
      prisma.pet.count(),
    ]);

    return {
      pets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async assertStaffBelongsToShelter(
    userId: number,
    shelterId: number,
    role: Role,
  ) {
    if (role === Role.ADMIN) return;

    const membership = await prisma.shelterStaff.findUnique({
      where: { userId_shelterId: { userId, shelterId } },
    });

    if (!membership) {
      throw new ForbiddenError('You do not belong to this shelter');
    }
  }

  async createPet(
    dto: CreatePetDTO,
    files: Express.Multer.File[],
    actor: { id: number; role: Role },
  ) {
    await this.assertStaffBelongsToShelter(actor.id, dto.shelterId, actor.role);

    try {
      const pet = await prisma.$transaction(async (trc) => {
        const created = await trc.pet.create({ data: dto });

        if (files.length) {
          await trc.petImage.createMany({
            data: files.map((file, index) => ({
              petId: created.id,
              imageUrl: `/uploads/pets/${file.filename}`,
              publicId: path.parse(file.filename).name,
              isPrimary: index === 0,
            })),
          });
        }

        return trc.pet.findUnique({
          where: { id: created.id },
          include: { images: true },
        });
      });

      return pet;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestError('shelterId does not exist');
      }
      throw error;
    }
  }
}
export default new PetService();
