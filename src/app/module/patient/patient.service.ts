import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import { Patient, Prisma } from "../../../generated/prisma/client";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelper/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/queryBuilder";
import {
    patientFilterAliases,
    patientFilterableFields,
    patientIncludeConfig,
    patientSearchableFields,
} from "./patient.constants";
import { IUpdatePatientHealthDataPayload, IUpdatePatientProfilePayload } from "./patient.interface";
import { convertToDateTime } from "./patient.utils";

const patientListInclude: Prisma.PatientInclude = {
    user: true,
    patientHealthData: true,
    _count: {
        select: {
            appointments: true,
            medicalReports: true,
            prescriptions: true,
            reviews: true,
        },
    },
};

/**
 * Translates the public filter names (status/gender/bloodGroup) to the
 * relation paths understood by QueryBuilder, so the API stays clean.
 */
const normalizePatientQuery = (query: IQueryParams): IQueryParams => {
    const normalized: IQueryParams = { ...query };

    for (const [alias, field] of Object.entries(patientFilterAliases)) {
        const value = normalized[alias];

        if (value !== undefined && value !== "") {
            normalized[field] = value;
            delete normalized[alias];
        }
    }

    return normalized;
};

const getAllPatients = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<Patient, Prisma.PatientWhereInput, Prisma.PatientInclude>(
        prisma.patient,
        normalizePatientQuery(query),
        {
            searchableFields: patientSearchableFields,
            filterableFields: patientFilterableFields,
        }
    );

    return queryBuilder
        .search()
        .filter()
        .where({
            isDeleted: false,
        })
        .include(patientListInclude)
        .dynamicInclude(patientIncludeConfig)
        .paginate()
        .sort()
        .fields()
        .execute();
};

const getPatientById = async (id: string) => {
    const patient = await prisma.patient.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            user: true,
            patientHealthData: true,
            medicalReports: {
                orderBy: { createdAt: "desc" },
            },
            appointments: {
                orderBy: { createdAt: "desc" },
                take: 5,
                include: {
                    doctor: true,
                    schedule: true,
                },
            },
            prescriptions: {
                orderBy: { createdAt: "desc" },
                take: 5,
                include: {
                    doctor: true,
                },
            },
            reviews: {
                orderBy: { createdAt: "desc" },
                take: 5,
            },
            _count: {
                select: {
                    appointments: true,
                    medicalReports: true,
                    prescriptions: true,
                    reviews: true,
                },
            },
        },
    });

    if (!patient) {
        throw new AppError(status.NOT_FOUND, "Patient not found");
    }

    return patient;
};

const updatePatientProfile = async (patientId: string, payload: IUpdatePatientProfilePayload) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            id: patientId,
        },
        select: {
            id: true,
            userId: true,
            name: true,
            profilePhoto: true,
        },
    });

    await prisma.$transaction(async (tx) => {
        if (payload.patientInfo) {
            await tx.patient.update({
                where: {
                    id: patientData.id,
                },
                data: {
                    ...payload.patientInfo,
                },
            });

            if (payload.patientInfo.name || payload.patientInfo.profilePhoto) {
                await tx.user.update({
                    where: {
                        id: patientData.userId,
                    },
                    data: {
                        name: payload.patientInfo.name ? payload.patientInfo.name : patientData.name,
                        image: payload.patientInfo.profilePhoto ? payload.patientInfo.profilePhoto : patientData.profilePhoto,
                    },
                });
            }
        }

        if (payload.patientHealthData) {
            const healthDataToSave: IUpdatePatientHealthDataPayload = {
                ...payload.patientHealthData,
            };

            if (payload.patientHealthData.dateOfBirth) {
                healthDataToSave.dateOfBirth = convertToDateTime(
                    typeof healthDataToSave.dateOfBirth === "string" ? healthDataToSave.dateOfBirth : undefined
                ) as Date;
            }

            await tx.patientHealthData.upsert({
                where: {
                    patientId: patientData.id,
                },
                update: healthDataToSave,
                create: {
                    patientId: patientData.id,
                    ...healthDataToSave,
                },
            });
        }

        if (payload.medicalReports && Array.isArray(payload.medicalReports) && payload.medicalReports.length > 0) {
            for (const report of payload.medicalReports) {
                if (report.shouldDelete && report.reportId) {
                    const deletedReport = await tx.medicalReport.delete({
                        where: {
                            id: report.reportId,
                        },
                    });

                    if (deletedReport.reportLink) {
                        await deleteFileFromCloudinary(deletedReport.reportLink);
                    }
                } else if (report.reportName && report.reportLink) {
                    await tx.medicalReport.create({
                        data: {
                            patientId: patientData.id,
                            reportName: report.reportName,
                            reportLink: report.reportLink,
                        },
                    });
                }
            }
        }
    });

    return prisma.patient.findUnique({
        where: {
            id: patientData.id,
        },
        include: {
            user: true,
            patientHealthData: true,
            medicalReports: true,
        },
    });
};

const updateMyProfile = async (user: IRequestUser, payload: IUpdatePatientProfilePayload) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
        select: {
            id: true,
        },
    });

    return updatePatientProfile(patientData.id, payload);
};

const updatePatient = async (id: string, payload: IUpdatePatientProfilePayload) => {
    if (!payload.patientInfo && !payload.patientHealthData) {
        throw new AppError(status.BAD_REQUEST, "At least one of patientInfo or patientHealthData must be provided");
    }

    const patient = await prisma.patient.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        select: {
            id: true,
        },
    });

    if (!patient) {
        throw new AppError(status.NOT_FOUND, "Patient not found");
    }

    return updatePatientProfile(patient.id, payload);
};

// Soft delete the patient and revoke their access.
const deletePatient = async (id: string) => {
    const patient = await prisma.patient.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        select: {
            id: true,
            userId: true,
        },
    });

    if (!patient) {
        throw new AppError(status.NOT_FOUND, "Patient not found");
    }

    await prisma.$transaction(async (tx) => {
        await tx.patient.update({
            where: { id: patient.id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

        await tx.user.update({
            where: { id: patient.userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.DELETED,
            },
        });

        await tx.session.deleteMany({
            where: { userId: patient.userId },
        });

        await tx.account.deleteMany({
            where: { userId: patient.userId },
        });
    });

    return { message: "Patient deleted successfully" };
};

export const PatientService = {
    getAllPatients,
    getPatientById,
    updateMyProfile,
    updatePatient,
    deletePatient,
};
