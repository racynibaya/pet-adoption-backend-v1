/*
  Warnings:

  - You are about to drop the column `address` on the `Shelter` table. All the data in the column will be lost.
  - Added the required column `addressLine` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Shelter` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Shelter_address_key";

-- AlterTable
ALTER TABLE "Shelter" DROP COLUMN "address",
ADD COLUMN     "addressLine" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Shelter_city_idx" ON "Shelter"("city");

-- CreateIndex
CREATE INDEX "Shelter_province_idx" ON "Shelter"("province");

-- CreateIndex
CREATE INDEX "Shelter_region_idx" ON "Shelter"("region");
