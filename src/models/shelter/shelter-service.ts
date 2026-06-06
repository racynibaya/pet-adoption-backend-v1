import prisma from '@config/prisma';

import { regionsForIsland } from './ph-locations';
import { ShelterCreateDTO, ShelterFilters, ShelterType } from './shelter-types';

class ShelterService {
  validateShelterData(data: ShelterCreateDTO) {
    const parsedData = ShelterType.parse(data);

    return parsedData;
  }

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
    } = this.validateShelterData(data);

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
