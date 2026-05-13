import prisma from '@config/prisma';

class UserServices {
  async getCurrentUser(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      omit: {
        refreshToken: true,
        hashedPassword: true,
        verifyToken: true,
        verifyTokenExpiry: true,
      },
    });
  }
}

export default new UserServices();
