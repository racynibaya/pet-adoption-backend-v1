import prisma from '@config/prisma';

import { CreateAdoptionRequestDTO } from './adoption-request-types';
import {
  Pet,
  AdoptionRequest,
  PetStatus,
} from '../../../generated/prisma/client';
import { ConflictError, NotFoundError } from '@utils/error';

class AdoptionRequestServices {
  private async getPet(petId: number): Promise<Pet | null> {
    return await prisma.pet.findUnique({
      where: { id: petId },
    });
  }

  private async isExistingRequest(
    userId: number,
    petId: number,
  ): Promise<boolean> {
    const data = await prisma.adoptionRequest.findFirst({
      where: {
        userId,
        petId,
        status: { in: ['REVIEWING', 'PENDING', 'APPROVED'] },
      },
    });

    return data ? true : false;
  }

  async createRequest(
    userId: number,
    details: CreateAdoptionRequestDTO,
  ): Promise<AdoptionRequest> {
    const pet = await this.getPet(details.petId);

    if (!pet) {
      throw new NotFoundError(`No pet found with that ${details.petId}`);
    }

    if (pet.status === PetStatus.ADOPTED) {
      throw new ConflictError('Pet is ADOPTED');
    }

    const existingRequest = await this.isExistingRequest(userId, details.petId);

    if (existingRequest) {
      throw new ConflictError('You already have an active application');
    }

    return await prisma.adoptionRequest.create({
      data: {
        ...details,
        userId,
      },
    });
  }
}

export default new AdoptionRequestServices();
