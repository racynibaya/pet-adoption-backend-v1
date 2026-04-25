/*
  Warnings:

  - Added the required column `userId` to the `AdoptionRequest` table without a default value. This is not possible if the table is not empty.
  - Made the column `petId` on table `AdoptionRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AdoptionRequest" DROP CONSTRAINT "AdoptionRequest_petId_fkey";

-- AlterTable
ALTER TABLE "AdoptionRequest" ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "petId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "AdoptionRequest" ADD CONSTRAINT "AdoptionRequest_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdoptionRequest" ADD CONSTRAINT "AdoptionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
