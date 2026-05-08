import prisma from '@config/prisma';

import { ShelterCreateDTO, ShelterType } from './shelter-types';

class ShelterService {
  validateShelterData(data: ShelterCreateDTO) {
    const parsedData = ShelterType.parse(data);

    return parsedData;
  }

  async createShelter(data: ShelterCreateDTO) {
    const { name, description, address, contactEmail, phoneNumber, ownerId } =
      this.validateShelterData(data);

    return await prisma.shelter.create({
      data: {
        name,
        description,
        address,
        contactEmail,
        phoneNumber,
        ownerId,
      },
    });
  }

  async updateShelterData(data: Partial<ShelterCreateDTO>, shelterId: number) {
    const { name, description, address, contactEmail, phoneNumber } = data;
    let updatedShelter = await prisma.shelter.update({
      where: { id: shelterId },
      data: { name, description, address, contactEmail, phoneNumber },
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

  async findAllShelters() {
    return await prisma.shelter.findMany();
  }

  async deleteShelter(shelterId: number) {
    return await prisma.shelter.delete({
      where: { id: shelterId },
    });
  }
}

export default new ShelterService();
