import * as z from 'zod';

export const ShelterType = z.object({
  name: z.string().min(5),
  description: z.string(),
  address: z.string(),
  phoneNumber: z.string(),
  contactEmail: z.email(),
  ownerId: z.number(),
});

export interface ShelterCreateDTO {
  name: string;
  description: string;
  address: string;
  contactEmail: string;
  phoneNumber: string;
  ownerId: number;
}
