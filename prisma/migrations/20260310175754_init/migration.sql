/*
  Warnings:

  - You are about to drop the column `avarageRating` on the `doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctor" DROP COLUMN "avarageRating",
ADD COLUMN     "averageRating" DOUBLE PRECISION DEFAULT 0.0;
