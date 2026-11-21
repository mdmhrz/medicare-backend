import z from "zod";

export const createDoctorSpecialtyZodSchema = z.object({
    doctorId: z.uuid("Doctor id must be a valid UUID"),
    specialtyId: z.uuid("Specialty id must be a valid UUID"),
});

export const DoctorSpecialtyValidation = {
    createDoctorSpecialtyZodSchema,
};
