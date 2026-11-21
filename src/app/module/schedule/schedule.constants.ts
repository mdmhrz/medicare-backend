import { Prisma } from "../../../generated/prisma/client";

export const scheduleSearchableFields = [
    "id",
    // Search by the doctor assigned to a slot
    "doctorSchedules.doctor.name",
    "doctorSchedules.doctor.email",
];

export const scheduleFilterableFields = [
    "id",
    "startDateTime",
    "endDateTime",
];

export const scheduleIncludeConfig: Prisma.ScheduleInclude = {
    appointments: {
        include: {
            doctor: true,
            patient: true,
            payment: true,
            prescription: true,
            review: true,
        },
    },
    doctorSchedules: {
        include: {
            doctor: true,
        },
    },
};
