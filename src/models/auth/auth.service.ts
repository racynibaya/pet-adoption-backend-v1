import prisma from '@config/prisma';
import { CreateUserInput } from './auth.types';
import { User } from '../../../generated/prisma/client';

class AuthService {
  async existingEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async createUser({ name, email, hashed, token }: CreateUserInput) {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword: hashed,
        isVerified: false,
        verifyToken: token,
        verifyTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), //1hr
      },
    });
  }

  async findUserViaToken(token: string) {
    const user = await prisma.user.findFirst({
      where: { verifyToken: token },
    });

    return user;
  }

  async updateVerification(record: User) {
    await prisma.user.update({
      where: { email: record.email },
      data: {
        isVerified: true,
        verifyToken: '',
      },
    });
  }
}

export default new AuthService();
