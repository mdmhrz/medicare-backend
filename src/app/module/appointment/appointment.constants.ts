import { Prisma } from "../../../generated/prisma/client";

export const appointmentSearchableFields = [
    "doctor.name",
    "doctor.email",
    "patient.name",
    "patient.email",
];

export const appointmentFilterableFields = [
    "status",
    "paymentStatus",
    "doctorId",
    "patientId",
];

export const appointmentIncludeConfig: Prisma.AppointmentInclude = {
    doctor: true,
    patient: true,
    schedule: true,
    payment: true,
    prescription: true,
    review: true,
};
