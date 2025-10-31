/*
  Warnings:

  - You are about to drop the column `alias` on the `acces` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `acces` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `acces` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `acces` table. All the data in the column will be lost.
  - You are about to drop the column `isEnabled` on the `acces` table. All the data in the column will be lost.
  - You are about to drop the column `licenseSku` on the `acces` table. All the data in the column will be lost.
  - Added the required column `email` to the `acces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productCode` to the `acces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `acces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `acces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "acces" DROP COLUMN "alias",
DROP COLUMN "deletedAt",
DROP COLUMN "displayName",
DROP COLUMN "isDeleted",
DROP COLUMN "isEnabled",
DROP COLUMN "licenseSku",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "productCode" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "userName" TEXT NOT NULL;
