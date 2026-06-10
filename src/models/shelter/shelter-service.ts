import prisma from '@config/prisma';

import { regionsForIsland } from './ph-locations';
import { ShelterCreateDTO, ShelterFilters } from './shelter-types';
import { ForbiddenError } from '@utils/error';
import { Role } from '../../../generated/prisma/client';

class ShelterService {
  async createShelter(data: ShelterCreateDTO) {
    const {
      name,
      description,
      addressLine,
      city,
      province,
      region,
      contactEmail,
      phoneNumber,
      ownerId,
    } = data;

    return await prisma.shelter.create({
      data: {
        name,
        description,
        addressLine,
        city,
        province,
        region,
        contactEmail,
        phoneNumber,
        ownerId,
      },
    });
  }

  async updateShelterData(data: Partial<ShelterCreateDTO>, shelterId: number) {
    const {
      name,
      description,
      addressLine,
      city,
      province,
      region,
      contactEmail,
      phoneNumber,
    } = data;

    const updatedShelter = await prisma.shelter.update({
      where: { id: shelterId },
      data: {
        name,
        description,
        addressLine,
        city,
        province,
        region,
        contactEmail,
        phoneNumber,
      },
    });

    return updatedShelter;
  }

  private async assertCanUpdate(
    userId: number,
    shelterId: number,
    role: Role,
  ): Promise<void> {
    if (role === Role.ADMIN) return;

    const shelterStaff = await this.findShelterStaff(userId, shelterId);

    if (!shelterStaff) {
      throw new ForbiddenError('You are not a staff member of any shelter');
    }

    if (role !== Role.STAFF) {
      throw new ForbiddenError(
        'You do not have permission to update this shelter',
      );
    }
  }

  async updateShelter(
    actor: { id: number; role: Role },
    shelterId: number,
    data: Partial<ShelterCreateDTO>,
  ) {
    await this.assertCanUpdate(actor.id, shelterId, actor.role);
    return this.updateShelterData(data, shelterId);
  }

  async findShelterStaff(userId: number, shelterId: number) {
    return await prisma.shelterStaff.findFirst({
      where: { userId: userId, shelterId },
    });
  }

  async findShelter(shelterId: number) {
    return await prisma.shelter.findUnique({
      where: { id: shelterId },
    });
  }

  async findAllShelters(page: number, limit: number, filters: ShelterFilters) {
    const skip = (page - 1) * limit;

    const whereCondition = {
      city: filters.city,
      province: filters.province,
      region: filters.island
        ? { in: regionsForIsland(filters.island) }
        : filters.region,
    };

    const [shelters, total] = await prisma.$transaction([
      prisma.shelter.findMany({
        where: whereCondition,
        skip,
        take: limit,
      }),
      prisma.shelter.count({
        where: whereCondition,
      }),
    ]);

    return {
      shelters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteShelter(shelterId: number) {
    return await prisma.shelter.delete({
      where: { id: shelterId },
    });
  }
}

export default new ShelterService();
