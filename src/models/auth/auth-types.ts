import * as z from 'zod';
import { User } from '../../../generated/prisma/client';

const User = z.object({
  email: z.email(),
  name: z.string().min(5),
  password: z.string(),
});

export type CreateUserInput = {
  name: string;
  email: string;
};

export const EmailInput = User.pick({ email: true });

export interface JwtPayload {
  email: string;
  password: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'STAFF' | 'ADMIN';
}

export type SanitizedUser = Omit<User, 'verifyTokenExpiry' | 'hashedPassword'>;
