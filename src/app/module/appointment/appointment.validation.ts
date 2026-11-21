import z from "zod";
import { AppointmentStatus } from "../../../generated/prisma/enums";

export const changeAppointmentStatusZodSchema = z.object({
    status: z.enum([
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.INPROGRESS,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELED,
    ]),
});

export const AppointmentValidation = {
    changeAppointmentStatusZodSchema,
};
