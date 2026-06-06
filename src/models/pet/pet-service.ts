import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

import prisma from '@config/prisma';
import { BadRequestError, ForbiddenError } from '@utils/error';

import { PetStatus, Role } from '../../../generated/prisma/client';
import { CreatePetDTO, PetFilters } from './pet-types';
import cloudinary from '@config/cloudinary';

class PetService {
  async getAllPets(page: number, limit: number, filters: PetFilters) {
    const skip = (page - 1) * limit;

    const whereCondition = {
      status: {
        not: PetStatus.ADOPTED,
      },
      species: filters.species,
      size: filters.size,
      gender: filters.gender,
    };

    const [pets, total] = await prisma.$transaction([
      prisma.pet.findMany({
        where: whereCondition,
        include: {
          images: true,
          shelter: true,
        },
        skip,
        take: limit,
      }),
      prisma.pet.count({
        where: whereCondition,
      }),
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

  async getPetById(id: number) {
    return prisma.pet.findUnique({
      where: { id },
      include: { images: true, shelter: true },
    });
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

  private async uploadToCloudinary(
    buffer: Buffer,
  ): Promise<{ publicId: string; secureUrl: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'pet-adoption' },
        (error, result) => {
          if (error || !result)
            return reject(new Error(error?.message ?? 'Upload failed'));
          resolve({ publicId: result.public_id, secureUrl: result.secure_url });
        },
      );
      stream.end(buffer);
    });
  }

  async createPet(
    dto: CreatePetDTO,
    files: Express.Multer.File[],
    actor: { id: number; role: Role },
  ) {
    await this.assertStaffBelongsToShelter(actor.id, dto.shelterId, actor.role);

    const uploaded = await Promise.all(
      files.map((file) => this.uploadToCloudinary(file.buffer)),
    );

    try {
      const pet = await prisma.$transaction(async (trc) => {
        const created = await trc.pet.create({ data: dto });

        if (files.length) {
          await trc.petImage.createMany({
            data: files.map((file, index) => {
              return {
                petId: created.id,
                imageUrl: uploaded[index].secureUrl,
                publicId: uploaded[index].publicId,
                isPrimary: index === 0,
              };
            }),
          });
        }

        return trc.pet.findUnique({
          where: { id: created.id },
          include: { images: true },
        });
      });

      return pet;
    } catch (error) {
      await Promise.all(
        uploaded.map((img) =>
          cloudinary.uploader.destroy(img.publicId).catch(() => undefined),
        ),
      );

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
