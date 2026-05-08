import * as z from 'zod';

import { User } from '../../../generated/prisma/client';

export const UserT = z.object({
  email: z.email(),
  name: z.string().min(5),
  password: z.string(),
  role: z.enum(['USER', 'STAFF', 'ADMIN']).default('USER').optional(),
});

export type CreateUserInput = {
  name: string;
  email: string;
};

export const EmailInput = UserT.pick({ email: true });

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

export const LoginSchema = UserT.omit({ name: true });

export type SanitizedUser = Omit<User, 'verifyTokenExpiry' | 'hashedPassword'>;
