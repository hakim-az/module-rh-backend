/*
  Warnings:

  - You are about to drop the column `upn` on the `acces` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `acces` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "acces_upn_key";

-- AlterTable
ALTER TABLE "acces" DROP COLUMN "upn",
DROP COLUMN "userName";
