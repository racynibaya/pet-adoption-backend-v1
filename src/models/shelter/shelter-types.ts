import * as z from 'zod';

import { ISLAND_GROUPS, REGIONS } from './ph-locations';

export const ShelterType = z.object({
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

export interface ShelterCreateDTO {
  name: string;
  description: string;
  addressLine: string;
  city: string;
  province: string;
  region: string;
  contactEmail: string;
  phoneNumber: string;
  ownerId: number;
}

export const shelterPaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
  region: z.enum(REGIONS).optional(),
  island: z.enum(ISLAND_GROUPS).optional(),
});

export type ShelterFilters = Pick<
  z.infer<typeof shelterPaginationSchema>,
  'city' | 'province' | 'region' | 'island'
>;
