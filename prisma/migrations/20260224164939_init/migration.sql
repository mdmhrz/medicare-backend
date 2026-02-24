/*
  Warnings:

  - You are about to drop the column `createdAt` on the `doctor_specialties` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `doctor_specialties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctor_specialties" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- RenameIndex
ALTER INDEX "idx_doctor_specialty_doctor_id" RENAME TO "idx_doctor_specialty_doctorId";

-- RenameIndex
ALTER INDEX "idx_doctor_specialty_specialty_id" RENAME TO "idx_doctor_specialty_specialtyId";

-- RenameIndex
ALTER INDEX "idx_specialty_is_deleted" RENAME TO "idx_specialty_isDeleted";
