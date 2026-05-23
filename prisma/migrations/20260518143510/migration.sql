/*
  Warnings:

  - Added the required column `awareOfMonthlyCosts` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasBackupCarePlan` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasChildren` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasOtherPetsNow` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasPreviousPetExperience` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasYard` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeType` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hoursAwayPerDay` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `householdSize` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownsHome` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reasonForAdopting` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearsOfExperience` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdoptionRequest" ADD COLUMN     "awareOfMonthlyCosts" BOOLEAN NOT NULL,
ADD COLUMN     "hasBackupCarePlan" BOOLEAN NOT NULL,
ADD COLUMN     "hasChildren" BOOLEAN NOT NULL,
ADD COLUMN     "hasOtherPetsNow" BOOLEAN NOT NULL,
ADD COLUMN     "hasPreviousPetExperience" BOOLEAN NOT NULL,
ADD COLUMN     "hasYard" BOOLEAN NOT NULL,
ADD COLUMN     "homeType" "HomeType" NOT NULL,
ADD COLUMN     "hoursAwayPerDay" INTEGER NOT NULL,
ADD COLUMN     "householdSize" INTEGER NOT NULL,
ADD COLUMN     "landlordAllowPets" BOOLEAN,
ADD COLUMN     "ownsHome" BOOLEAN NOT NULL,
ADD COLUMN     "reasonForAdopting" TEXT NOT NULL,
ADD COLUMN     "yardFenced" BOOLEAN,
ADD COLUMN     "yearsOfExperience" INTEGER NOT NULL;
