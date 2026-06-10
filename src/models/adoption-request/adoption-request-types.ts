import z from 'zod';
import { HomeType } from '../../../generated/prisma/enums';

export const adoptionRequestSchema = z.object({
  petId: z.number(),
  message: z.string().optional(),
  homeType: z.enum(HomeType),
  hasYard: z.boolean(),
  yardFenced: z.boolean().optional(),
  ownsHome: z.boolean().default(false),
  landlordAllowPets: z.boolean().optional(),
  householdSize: z.number(),
  hasChildren: z.boolean(),
  hasPreviousPetExperience: z.boolean(),
  yearsOfExperience: z.number(),
  hoursAwayPerDay: z.number(),
  hasOtherPetsNow: z.boolean(),
  reasonForAdopting: z.string().min(10).max(1000),
  hasBackupCarePlan: z.boolean(),
  awareOfMonthlyCosts: z.boolean(),
});

export type CreateAdoptionRequestDTO = z.infer<typeof adoptionRequestSchema>;
