import z from 'zod';

export const petPaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const createPetBodySchema = z.object({
  name: z.string().min(1).max(100),
  species: z.enum(['DOG', 'CAT', 'RABBIT', 'BIRD', 'OTHER']),
  breed: z.string().min(1),
  ageMonths: z.coerce.number().int().min(0).max(600),
  gender: z.enum(['MALE', 'FEMALE']),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']),
  description: z.string().min(1),
  shelterId: z.coerce.number().int().positive(),
  status: z.enum(['PENDING', 'AVAILABLE', 'ADOPTED']).optional(),
});

export type CreatePetDTO = z.infer<typeof createPetBodySchema>;
