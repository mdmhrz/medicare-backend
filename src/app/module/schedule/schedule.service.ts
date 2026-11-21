import { addHours, addMinutes, format } from "date-fns";
import status from "http-status";
import { Prisma, Schedule } from "../../../generated/prisma/client";
import AppError from "../../errorHelper/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/queryBuilder";
import { scheduleFilterableFields, scheduleIncludeConfig, scheduleSearchableFields } from "./schedule.constants";
import { ICreateSchedulePayload, IUpdateSchedulePayload } from "./schedule.interface";
import { convertDateTime } from "./schedule.utils";

const SLOT_INTERVAL_MINUTES = 30;

const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return (hours * 60) + minutes;
};

const buildDateTime = (date: string, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    return addMinutes(
        addHours(`${format(new Date(date), "yyyy-MM-dd")}`, hours),
        minutes
    );
};

const createSchedule = async (payload: ICreateSchedulePayload) => {
    const { startDate, endDate, startTime, endTime } = payload;

    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    if (Number.isNaN(currentDate.getTime()) || Number.isNaN(lastDate.getTime())) {
        throw new AppError(status.BAD_REQUEST, "Invalid date range");
    }

    if (currentDate > lastDate) {
        throw new AppError(status.BAD_REQUEST, "End date cannot be earlier than start date");
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
        throw new AppError(status.BAD_REQUEST, "End time must be after start time");
    }

    const slots: Array<{ startDateTime: Date; endDateTime: Date }> = [];

    while (currentDate <= lastDate) {
        const dateLabel = format(currentDate, "yyyy-MM-dd");
        const dayStart = buildDateTime(dateLabel, startTime);
        const dayEnd = buildDateTime(dateLabel, endTime);

        let cursor = new Date(dayStart);

        while (cursor < dayEnd) {
            slots.push({
                startDateTime: await convertDateTime(cursor),
                endDateTime: await convertDateTime(addMinutes(cursor, SLOT_INTERVAL_MINUTES)),
            });

            cursor = addMinutes(cursor, SLOT_INTERVAL_MINUTES);
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    if (slots.length === 0) {
        throw new AppError(status.BAD_REQUEST, "No schedule slots would be created");
    }

    // Reject the whole request if any generated slot overlaps an existing slot.
    const conflictingSchedule = await prisma.schedule.findFirst({
        where: {
            OR: slots.map((slot) => ({
                startDateTime: { lt: slot.endDateTime },
                endDateTime: { gt: slot.startDateTime },
            })),
        },
        select: { id: true },
    });

    if (conflictingSchedule) {
        throw new AppError(status.BAD_REQUEST, "One or more of these schedule slots already exist");
    }

    return prisma.$transaction(
        slots.map((slot) => prisma.schedule.create({ data: slot }))
    );
};

const getAllSchedules = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<Schedule, Prisma.ScheduleWhereInput, Prisma.ScheduleInclude>(
        prisma.schedule,
        query,
        {
            searchableFields: scheduleSearchableFields,
            filterableFields: scheduleFilterableFields,
        }
    );

    let builder = queryBuilder.search().filter();

    // Availability is a relation filter, so it is applied explicitly.
    if (query.booked === "true") {
        builder = builder.where({ doctorSchedules: { some: { isBooked: true } } });
    } else if (query.booked === "false") {
        builder = builder.where({ doctorSchedules: { none: { isBooked: true } } });
    }

    return builder
        .include({
            doctorSchedules: {
                include: {
                    doctor: true,
                },
            },
            _count: {
                select: {
                    appointments: true,
                    doctorSchedules: true,
                },
            },
        })
        .dynamicInclude(scheduleIncludeConfig)
        .paginate()
        .sort()
        .fields()
        .execute();
};

const getScheduleById = async (id: string) => {
    const schedule = await prisma.schedule.findUnique({
        where: {
            id,
        },
        include: {
            doctorSchedules: {
                include: {
                    doctor: true,
                },
            },
            appointments: {
                include: {
                    patient: true,
                    doctor: true,
                    payment: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
            _count: {
                select: {
                    appointments: true,
                    doctorSchedules: true,
                },
            },
        },
    });

    if (!schedule) {
        throw new AppError(status.NOT_FOUND, "Schedule not found");
    }

    return schedule;
};

const updateSchedule = async (id: string, payload: IUpdateSchedulePayload) => {
    const existingSchedule = await prisma.schedule.findUnique({
        where: { id },
    });

    if (!existingSchedule) {
        throw new AppError(status.NOT_FOUND, "Schedule not found");
    }

    // Allow partial updates by falling back to the current slot values.
    const startDate = payload.startDate ?? format(existingSchedule.startDateTime, "yyyy-MM-dd");
    const endDate = payload.endDate ?? format(existingSchedule.endDateTime, "yyyy-MM-dd");
    const startTime = payload.startTime ?? format(existingSchedule.startDateTime, "HH:mm");
    const endTime = payload.endTime ?? format(existingSchedule.endDateTime, "HH:mm");

    if (toMinutes(startTime) >= toMinutes(endTime)) {
        throw new AppError(status.BAD_REQUEST, "End time must be after start time");
    }

    const startDateTime = await convertDateTime(buildDateTime(startDate, startTime));
    const endDateTime = await convertDateTime(buildDateTime(endDate, endTime));

    if (startDateTime >= endDateTime) {
        throw new AppError(status.BAD_REQUEST, "End time must be after start time");
    }

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

    return prisma.schedule.update({
        where: { id },
        data: {
            startDateTime,
            endDateTime,
        },
    });
};

const deleteSchedule = async (id: string) => {
    const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: {
            doctorSchedules: {
                select: { isBooked: true },
            },
            _count: {
                select: { appointments: true },
            },
        },
    });

    if (!schedule) {
        throw new AppError(status.NOT_FOUND, "Schedule not found");
    }

    const hasBookedSlot = schedule.doctorSchedules.some((doctorSchedule) => doctorSchedule.isBooked);

    if (hasBookedSlot || (schedule._count?.appointments ?? 0) > 0) {
        throw new AppError(
            status.BAD_REQUEST,
            "Cannot delete a schedule that is booked or has appointments"
        );
    }

    await prisma.schedule.delete({
        where: { id },
    });

    return true;
};

export const ScheduleService = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
};
