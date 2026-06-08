import * as z from 'zod';

import { Role, User } from '../../../generated/prisma/client';

export const userSchema = z.object({
  email: z.email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(8),
});

export type CreateUserInput = {
  name: string;
  email: string;
};

export const emailInput = userSchema.pick({ email: true });

export interface JwtPayload {
  id: number;
  role: Role;
  email: string;
}

export type CreateUserDTO = z.infer<typeof userSchema>;

export const loginSchema = userSchema.pick({ email: true, password: true });

export type SanitizedUser = Omit<User, 'verifyTokenExpiry' | 'hashedPassword'>;

export type LoginUserDTO = z.infer<typeof loginSchema>;
