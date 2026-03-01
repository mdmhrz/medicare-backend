/*
  Warnings:

  - Made the column `appointmentFee` on table `doctor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "doctor" ALTER COLUMN "appointmentFee" SET NOT NULL;
