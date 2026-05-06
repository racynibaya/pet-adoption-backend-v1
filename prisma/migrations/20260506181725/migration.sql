/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `Shelter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Shelter_address_key" ON "Shelter"("address");
