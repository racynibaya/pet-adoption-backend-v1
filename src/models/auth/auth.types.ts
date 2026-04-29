import * as z from 'zod';

const User = z.object({
  email: z.email(),
  name: z.string().min(5),
  password: z.string(),
});

export type CreateUserInput = {
  name: string;
  email: string;
  hashed: string;
  token: string;
};

export const EmailInput = User.pick({ email: true });
