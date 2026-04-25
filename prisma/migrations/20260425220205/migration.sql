/*
  Warnings:

  - The values [REVIEWING] on the enum `PetStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `userId` on the `Pet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,petId]` on the table `AdoptionRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdoptionRequestStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "PetStatus_new" AS ENUM ('PENDING', 'AVAILABLE', 'ADOPTED');
ALTER TABLE "public"."Pet" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Pet" ALTER COLUMN "status" TYPE "PetStatus_new" USING ("status"::text::"PetStatus_new");
ALTER TYPE "PetStatus" RENAME TO "PetStatus_old";
ALTER TYPE "PetStatus_new" RENAME TO "PetStatus";
DROP TYPE "public"."PetStatus_old";
ALTER TABLE "Pet" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Pet" DROP CONSTRAINT "Pet_userId_fkey";

-- AlterTable
ALTER TABLE "AdoptionRequest" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "AdoptionRequestStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AdoptionRequest_userId_petId_key" ON "AdoptionRequest"("userId", "petId");
