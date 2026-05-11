import * as z from 'zod';

import { Role, User } from '../../../generated/prisma/client';

export const userSchema = z.object({
  email: z.email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string(),
  role: z.enum(Role).optional(),
});

export type CreateUserInput = {
  name: string;
  email: string;
};

export const EmailInput = userSchema.pick({ email: true });

export interface JwtPayload {
  id: number;
  role: Role;
  email: string;
}

export type CreateUserDTO = z.infer<typeof userSchema>;

export const LoginSchema = userSchema.pick({ email: true, password: true });

export type SanitizedUser = Omit<User, 'verifyTokenExpiry' | 'hashedPassword'>;
