import status from "http-status";
import { Prisma, Specialty } from "../../../generated/prisma/client";
import AppError from "../../errorHelper/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/queryBuilder";
import { specialtyFilterableFields, specialtySearchableFields } from "./specialty.constants";
import { ICreateSpecialtyPayload, IUpdateSpecialtyPayload } from "./specialty.interface";

const createSpecialty = async (payload: ICreateSpecialtyPayload): Promise<Specialty> => {
    return prisma.specialty.create({
        data: payload,
    });
};

const getAllSpecialties = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<Specialty, Prisma.SpecialtyWhereInput, Prisma.SpecialtyInclude>(
        prisma.specialty,
        query,
        {
            searchableFields: specialtySearchableFields,
            filterableFields: specialtyFilterableFields,
        }
    );

    return queryBuilder
        .search()
        .filter()
        .where({
            isDeleted: false,
        })
        .include({
            _count: {
                select: {
                    doctorSpecialties: true,
                },
            },
        })
        .paginate()
        .sort()
        .fields()
        .execute();
};

const updateSpecialtyById = async (id: string, payload: IUpdateSpecialtyPayload): Promise<Specialty> => {
    const specialty = await prisma.specialty.findFirst({
        where: {
            id,
            isDeleted: false,
        },
    });

    if (!specialty) {
        throw new AppError(status.NOT_FOUND, "Specialty not found");
    }

    if (!payload.title && !payload.description && !payload.icon) {
        throw new AppError(status.BAD_REQUEST, "No data provided to update");
    }

    return prisma.specialty.update({
        where: { id },
        data: payload,
    });
};

// Soft delete keeps existing doctor-specialty links intact.
const deleteSpecialtyById = async (id: string): Promise<Specialty> => {
    const specialty = await prisma.specialty.findFirst({
        where: {
            id,
            isDeleted: false,
        },
    });

    if (!specialty) {
        throw new AppError(status.NOT_FOUND, "Specialty not found");
    }

    return prisma.specialty.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });
};

export const SpecialtyService = {
    createSpecialty,
    getAllSpecialties,
    updateSpecialtyById,
    deleteSpecialtyById,
};
