import prisma from '@config/prisma';

class PetService {
  async getAllPets(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [pets, total] = await prisma.$transaction([
      prisma.pet.findMany({
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
}
export default new PetService();
