import { Prisma } from "../../../generated/prisma/client";

export const patientSearchableFields = [
    "name",
    "email",
    "contactNumber",
    "address",
];

export const patientFilterableFields = [
    "user.status",
    "user.role",
    "patientHealthData.gender",
    "patientHealthData.bloodGroup",
];

/**
 * Public API aliases for filters that live on relations.
 * /patients?status=ACTIVE&gender=FEMALE&bloodGroup=A_POSITIVE
 */
export const patientFilterAliases: Record<string, string> = {
    status: "user.status",
    gender: "patientHealthData.gender",
    bloodGroup: "patientHealthData.bloodGroup",
};

export const patientIncludeConfig: Prisma.PatientInclude = {
    user: true,
    patientHealthData: true,
    medicalReports: true,
    appointments: {
        include: {
            doctor: true,
            schedule: true,
        },
    },
    prescriptions: {
        include: {
            doctor: true,
        },
    },
    reviews: true,
};
