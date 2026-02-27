import { Prisma } from "../../../generated/prisma/client";

export const doctorSearchableFields = [
    'name',
    'email',
    'qualification',
    'designation',
    'currentWorkingPlace',
    'registrationNumber',
    'specialties.specialty.title'
];

export const doctorFilterableFields = [
    'gender',
    'isDeleted',
    'appoinmentFee',
    'experience',
    'registrationNumber',
    'specialties.specialtyId',
    'currentWorkingPlace',
    'designation',
    'qualification',
    'specialties.specialty.title',
    'user.role'
];

export const doctorIncludeConfig: Partial<Record<keyof Prisma.DoctorInclude, Prisma.DoctorInclude[keyof Prisma.DoctorInclude]>> = {
    user: true,
    specialties: {
        include: {
            specialty: true
        }
    },
    appointments: {
        include: {
            patient: true,
            doctor: true,

        }
    },
    doctorSchedules: {
        include: {
            schedule: true
        }
    },
    prescriptions: true,
    reviews: true,
}