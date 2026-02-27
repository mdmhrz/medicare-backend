/*
  Warnings:

  - You are about to drop the column `appoinmentFee` on the `doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctor" DROP COLUMN "appoinmentFee",
ADD COLUMN     "appoinmentFee" DOUBLE PRECISION DEFAULT 0;
