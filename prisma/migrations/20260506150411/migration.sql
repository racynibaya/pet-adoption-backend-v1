/*
  Warnings:

  - Added the required column `address` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactEmail` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Shelter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shelter" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "contactEmail" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "ownerId" INTEGER NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Shelter" ADD CONSTRAINT "Shelter_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
