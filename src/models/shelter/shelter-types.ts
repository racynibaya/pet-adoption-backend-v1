import { z } from 'zod';

import { ISLAND_GROUPS, REGIONS } from './ph-locations';

export const shelterSchema = z.object({
  name: z.string().min(5),
  description: z.string(),
  addressLine: z.string(),
  city: z.string().trim(),
  province: z.string().trim(),
  region: z.enum(REGIONS),
  phoneNumber: z.string(),
  contactEmail: z.email(),
  ownerId: z.number(),
});

export const shelterPaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
  region: z.enum(REGIONS).optional(),
  island: z.enum(ISLAND_GROUPS).optional(),
});

export const shelterIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type ShelterCreateDTO = z.infer<typeof shelterSchema>;

// Pick<T, K>:
// T = the source type you're picking from
// K = the keys you want to keep
export type ShelterFilters = Pick<
  z.infer<typeof shelterPaginationSchema>,
  'city' | 'province' | 'region' | 'island'
>;

export type ShelterPaginationDTO = z.infer<typeof shelterPaginationSchema>;
