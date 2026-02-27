import { addHours, addMinutes, format } from "date-fns";
import { Prisma, Schedule } from "../../../generated/prisma/client";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/queryBuilder";
import { scheduleFilterableFields, scheduleIncludeConfig, scheduleSearchableFields } from "./schedule.constants";
import { ICreateSchedulePayload, IUpdateSchedulePayload } from "./schedule.interface";
import { convertDateTime } from "./schedule.utils";
import AppError from "../../errorHelper/AppError";
import status from "http-status";

const createSchedule = async (payload: ICreateSchedulePayload) => {
    const { startDate, endDate, startTime, endTime } = payload;

    const interval = 30;

    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    if (currentDate > lastDate) {
        throw new AppError(status.BAD_REQUEST, "End date cannot be earlier than start date");
    }

    const schedules = [];



    while (currentDate <= lastDate) {



        const startDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(startTime.split(":")[0])
                ),
                Number(startTime.split(":")[1])
            )
        );

        const endDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(endTime.split(":")[0])
                ),
                Number(endTime.split(":")[1])
            )
        );

        while (startDateTime < endDateTime) {
            const s = await convertDateTime(startDateTime);
            const e = await convertDateTime(addMinutes(startDateTime, interval));

            const scheduleData = {
                startDateTime: s,
                endDateTime: e
            }

            console.log(scheduleData, 'check data');

            const existingSchedule = await prisma.schedule.findFirst({
                where: {
                    startDateTime: scheduleData.startDateTime,
                    endDateTime: scheduleData.endDateTime
                }
            })

            if (existingSchedule) {
                throw new AppError(status.BAD_REQUEST, "Schedule already exists");
            }

            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: scheduleData
                })
                console.log(result);
                schedules.push(result);
            }

            startDateTime.setMinutes(startDateTime.getMinutes() + interval)
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(schedules, 'at last');

    return schedules;
}

const getAllSchedules = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<Schedule, Prisma.ScheduleWhereInput, Prisma.ScheduleInclude>(
        prisma.schedule,
        query,
        {
            searchableFields: scheduleSearchableFields,
            filterableFields: scheduleFilterableFields
        }
    )

    const result = await queryBuilder
        .search()
        .filter()
        .paginate()
        .dynamicInclude(scheduleIncludeConfig)
        .sort()
        .fields()
        .execute();

    return result;
}

const getScheduleById = async (id: string) => {
    const schedule = await prisma.schedule.findUnique({
        where: {
            id: id
        }
    });
    return schedule;
}

// refactoring - doctor's appointment or booked slot conflict check
const updateSchedule = async (id: string, payload: IUpdateSchedulePayload) => {
    const { startDate, endDate, startTime, endTime } = payload;

    const startDateTime = new Date(
        addMinutes(
            addHours(
                `${format(new Date(startDate), "yyyy-MM-dd")}`,
                Number(startTime.split(":")[0])
            ),
            Number(startTime.split(":")[1])
        )
    );

    const endDateTime = new Date(
        addMinutes(
            addHours(
                `${format(new Date(endDate), "yyyy-MM-dd")}`,
                Number(endTime.split(":")[0])
            ),
            Number(endTime.split(":")[1])
        )
    );

    // Check for overlapping schedule
    const conflictingSchedule = await prisma.schedule.findFirst({
        where: {
            id: { not: id },
            AND: [
                { startDateTime: { lt: endDateTime } },
                { endDateTime: { gt: startDateTime } },
            ],
        },
    });

    if (conflictingSchedule) {
        throw new AppError(status.BAD_REQUEST, "This time slot overlaps with an existing schedule");
    }

    const updatedSchedule = await prisma.schedule.update({
        where: { id },
        data: {
            startDateTime,
            endDateTime,
        },
    });

    return updatedSchedule;
};


const deleteSchedule = async (id: string) => {
    await prisma.schedule.delete({
        where: {
            id: id
        }
    });
    return true;
}

export const ScheduleService = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule
}