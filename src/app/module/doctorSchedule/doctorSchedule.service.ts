import status from "http-status";
import { DoctorSchedules, Prisma } from "../../../generated/prisma/client";
import AppError from "../../errorHelper/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/queryBuilder";
import { doctorScheduleFilterableFields, doctorScheduleIncludeConfig, doctorScheduleSearchableFields } from "./doctorSchedule.constants";
import { ICreateDoctorSchedulePayload, IUpdateDoctorSchedulePayload } from "./doctorSchedule.interface";

const createMyDoctorSchedule = async (user: IRequestUser, payload: ICreateDoctorSchedulePayload) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });

    const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
        doctorId: doctorData.id,
        scheduleId
    }))

    await prisma.doctorSchedules.createMany({
        data: doctorScheduleData
    });

    const result = await prisma.doctorSchedules.findMany({
        where: {
            doctorId: doctorData.id,
            scheduleId: {
                in: payload.scheduleIds
            }
        },
        include: {
            schedule: true
        }
    })


    return result;
}

const getMyDoctorSchedules = async (user: IRequestUser, query: IQueryParams) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });
    const queryBuilder = new QueryBuilder<DoctorSchedules, Prisma.DoctorSchedulesWhereInput, Prisma.DoctorSchedulesInclude>(prisma.doctorSchedules,
        {
            doctorId: doctorData.id,
            ...query
        },
        {
            filterableFields: doctorScheduleFilterableFields,
            searchableFields: doctorScheduleSearchableFields
        })
    const doctorSchedules = await queryBuilder
        .search()
        .filter()
        .paginate()
        .include({
            schedule: true,
            doctor: {
                include: {
                    user: true,
                }
            }
        })
        .sort()
        .fields()
        .dynamicInclude(doctorScheduleIncludeConfig)
        .execute();
    return doctorSchedules;
}

const getAllDoctorSchedules = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<DoctorSchedules, Prisma.DoctorSchedulesWhereInput, Prisma.DoctorSchedulesInclude>(prisma.doctorSchedules, query, {
        filterableFields: doctorScheduleFilterableFields,
        searchableFields: doctorScheduleSearchableFields
    })

    const result = await queryBuilder
        .search()
        .filter()
        .include({
            doctor: {
                include: {
                    user: true,
                },
            },
            schedule: true,
        })
        .dynamicInclude(doctorScheduleIncludeConfig)
        .paginate()
        .sort()
        .execute();

    return result;
}

const getDoctorScheduleById = async (doctorId: string, scheduleId: string) => {
    const doctorSchedule = await prisma.doctorSchedules.findUnique({
        where: {
            doctorId_scheduleId: {
                doctorId,
                scheduleId,
            },
        },
        include: {
            schedule: true,
            doctor: {
                include: {
                    user: true,
                },
            },
        },
    });

    if (!doctorSchedule) {
        throw new AppError(status.NOT_FOUND, "Doctor schedule not found");
    }

    return doctorSchedule;
}

// Admin-only: remove a doctor from a slot. A booked slot must be handled
// through the appointment flow instead of being silently unassigned.
const deleteDoctorSchedule = async (doctorId: string, scheduleId: string) => {
    const doctorSchedule = await prisma.doctorSchedules.findUnique({
        where: {
            doctorId_scheduleId: {
                doctorId,
                scheduleId,
            },
        },
    });

    if (!doctorSchedule) {
        throw new AppError(status.NOT_FOUND, "Doctor schedule not found");
    }

    if (doctorSchedule.isBooked) {
        throw new AppError(status.BAD_REQUEST, "Cannot unassign a booked schedule");
    }

    await prisma.doctorSchedules.delete({
        where: {
            doctorId_scheduleId: {
                doctorId,
                scheduleId,
            },
        },
    });

    return { message: "Doctor schedule unassigned successfully" };
}


const updateMyDoctorSchedule = async (user: IRequestUser, payload: IUpdateDoctorSchedulePayload) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });

    const deleteIds = payload.scheduleIds.filter(schedule => schedule.shouldDelete).map(schedule => schedule.id);

    const createIds = payload.scheduleIds.filter(schedule => !schedule.shouldDelete).map(schedule => schedule.id);

    const result = await prisma.$transaction(async (tx) => {

        await tx.doctorSchedules.deleteMany({
            where: {
                isBooked: false,
                doctorId: doctorData.id,
                scheduleId: {
                    in: deleteIds
                }
            }
        });

        const doctorScheduleData = createIds.map((scheduleId) => ({
            doctorId: doctorData.id,
            scheduleId
        }))

        const result = await tx.doctorSchedules.createMany({
            data: doctorScheduleData
        });

        return result;
    })

    return result;
}

const deleteMyDoctorSchedule = async (id: string, user: IRequestUser) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });

    await prisma.doctorSchedules.deleteMany({
        where: {
            isBooked: false,
            doctorId: doctorData.id,
            scheduleId: id
        }
    });
}



export const DoctorScheduleService = {
    createMyDoctorSchedule,
    getAllDoctorSchedules,
    getDoctorScheduleById,
    updateMyDoctorSchedule,
    deleteMyDoctorSchedule,
    getMyDoctorSchedules,
    deleteDoctorSchedule,
}