import status from "http-status";
import { DoctorSpecialty, Prisma } from "../../../generated/prisma/client";
import AppError from "../../errorHelper/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/queryBuilder";
import {
    doctorSpecialtyFilterableFields,
    doctorSpecialtySearchableFields,
} from "./doctorSpecialty.constants";
import { ICreateDoctorSpecialtyPayload } from "./doctorSpecialty.interface";

const getAllDoctorSpecialties = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<DoctorSpecialty, Prisma.DoctorSpecialtyWhereInput, Prisma.DoctorSpecialtyInclude>(
        prisma.doctorSpecialty,
        // DoctorSpecialty has no createdAt column, so provide a safe default sort.
        { ...query, sortBy: query.sortBy ?? "id" },
        {
            searchableFields: doctorSpecialtySearchableFields,
            filterableFields: doctorSpecialtyFilterableFields,
        }
    );

    return queryBuilder
        .search()
        .filter()
        .include({
            doctor: {
                include: {
                    user: true,
                },
            },
            specialty: true,
        })
        .paginate()
        .sort()
        .execute();
};

const getDoctorSpecialtyById = async (id: string) => {
    const doctorSpecialty = await prisma.doctorSpecialty.findUnique({
        where: { id },
        include: {
            doctor: {
                include: {
                    user: true,
                },
            },
            specialty: true,
        },
    });

    if (!doctorSpecialty) {
        throw new AppError(status.NOT_FOUND, "Doctor specialty not found");
    }

    return doctorSpecialty;
};

const createDoctorSpecialty = async (payload: ICreateDoctorSpecialtyPayload) => {
    const doctor = await prisma.doctor.findFirst({
        where: {
            id: payload.doctorId,
            isDeleted: false,
        },
        select: { id: true },
    });

    if (!doctor) {
        throw new AppError(status.NOT_FOUND, "Doctor not found");
    }

    const specialty = await prisma.specialty.findFirst({
        where: {
            id: payload.specialtyId,
            isDeleted: false,
        },
        select: { id: true },
    });

    if (!specialty) {
        throw new AppError(status.NOT_FOUND, "Specialty not found");
    }

    const existing = await prisma.doctorSpecialty.findUnique({
        where: {
            doctorId_specialtyId: {
                doctorId: payload.doctorId,
                specialtyId: payload.specialtyId,
            },
        },
    });

    if (existing) {
        throw new AppError(status.CONFLICT, "This specialty is already assigned to the doctor");
    }

    return prisma.doctorSpecialty.create({
        data: payload,
        include: {
            doctor: {
                include: {
                    user: true,
                },
            },
            specialty: true,
        },
    });
};

const deleteDoctorSpecialty = async (id: string) => {
    const doctorSpecialty = await prisma.doctorSpecialty.findUnique({
        where: { id },
    });

    if (!doctorSpecialty) {
        throw new AppError(status.NOT_FOUND, "Doctor specialty not found");
    }

    await prisma.doctorSpecialty.delete({
        where: { id },
    });

    return { message: "Specialty unassigned from doctor successfully" };
};

export const DoctorSpecialtyService = {
    getAllDoctorSpecialties,
    getDoctorSpecialtyById,
    createDoctorSpecialty,
    deleteDoctorSpecialty,
};
