import { Prisma } from "../../../generated/prisma/client";

export const doctorSpecialtySearchableFields = [
    "doctor.name",
    "doctor.email",
    "specialty.title",
];

export const doctorSpecialtyFilterableFields = [
    "doctorId",
    "specialtyId",
];

export const doctorSpecialtyIncludeConfig: Prisma.DoctorSpecialtyInclude = {
    doctor: {
        include: {
            user: true,
        },
    },
    specialty: true,
};
