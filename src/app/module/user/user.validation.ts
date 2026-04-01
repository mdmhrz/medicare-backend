import { Gender } from "../../../generated/prisma/enums";
import z from "zod";

export const createDoctorZodSchema = z.object({
    password: z.string("Password is required").min(6, "Password must be at least 6 characters long").max(20, "Password must be at most 20 characters long"),
    doctor: z.object({
        name: z.string("Name is required").min(5, "Name must be at least 5 characters long").max(30, "Name must be at most 30 characters long"),
        email: z.string("Email is required").email("Invalid email format"),
        profilePhoto: z.string("Profile photo must be a string").optional(),
        contactNumber: z.string("Contact number is required").min(11, "Contact number must be at least 11 characters long").max(14, "Contact number must be at most 14 characters long"),
        address: z.string("Address must be a string").max(100, "Address must be at most 100 characters long").optional(),
        registrationNumber: z.string("Registration number must be a string").optional(),
        experience: z.int("Experience must be a integer").nonnegative("Experience must be non-negative").optional(),
        gender: z.enum([Gender.FEMALE, Gender.MALE, Gender.OTHER], "Gender must be one of MALE, FEMALE, OTHERS").optional(),
        appointmentFee: z.number("Appointment fee must be a number").nonnegative(),
        qualification: z.string("Qualification must be a string").min(5, "Qualification must be at least 5 characters long").max(50, "Qualification must be at most 50 characters long"),
        currentWorkingPlace: z.string("Current working place is required").min(5, "Current working place must be at least 5 characters long").max(50, "Current working place must be at most 50 characters long"),
        designation: z.string("Designation is required").min(5, "Designation must be at least 5 characters long").max(50, "Designation must be at most 50 characters long"),
    }),
    specialties: z.array(z.uuid("Specialty must be a array of uuid")).min(1, "At least one specialty is required"),
})