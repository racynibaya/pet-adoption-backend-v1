import * as z from 'zod';

import { Role, User } from '../../../generated/prisma/client';

export const userSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  firstName: z.string().min(5, { message: 'Must be at least 5 characters' }),
  lastName: z.string().min(5, { message: 'Must be at least 5 characters' }),
  password: z.string().min(8, { message: 'Must be at least 8 characters' }),
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
