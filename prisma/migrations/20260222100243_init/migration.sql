/*
  Warnings:

  - You are about to drop the column `specialization` on the `doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctor" DROP COLUMN "specialization",
ADD COLUMN     "designation" TEXT;
