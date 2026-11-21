import z from "zod";
import { BloodGroup, Gender } from "../../../generated/prisma/enums";

const patientInfoZodSchema = z.object({
    name: z.string("Name must be a string").min(1, "Name cannot be empty").max(100, "Name must be less than 100 characters").optional(),
    profilePhoto: z.url("Profile photo must be a valid URL").optional(),
    contactNumber: z.string("Contact number must be a string").min(1, "Contact number cannot be empty").max(20, "Contact number must be less than 20 characters").optional(),
    address: z.string("Address must be a string").min(1, "Address cannot be empty").max(200, "Address must be less than 200 characters").optional(),
});

const patientHealthDataZodSchema = z.object({
    gender: z.enum([Gender.FEMALE, Gender.MALE, Gender.OTHER]).optional(),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
    }).optional(),
    bloodGroup: z.enum([BloodGroup.A_POSITIVE, BloodGroup.A_NEGATIVE, BloodGroup.B_POSITIVE, BloodGroup.B_NEGATIVE, BloodGroup.AB_POSITIVE, BloodGroup.AB_NEGATIVE, BloodGroup.O_POSITIVE, BloodGroup.O_NEGATIVE]).optional(),
    hasAllergies: z.boolean().optional(),
    hasDiabetes: z.boolean().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    smokingStatus: z.boolean().optional(),
    dietaryPreferences: z.string().optional(),
    pregnancyStatus: z.boolean().optional(),
    mentalHealthHistory: z.string().optional(),
    immunizationStatus: z.string().optional(),
    hasPastSurgeries: z.boolean().optional(),
    recentAnxiety: z.boolean().optional(),
    recentDepression: z.boolean().optional(),
    maritalStatus: z.string().optional(),
});

const medicalReportsZodSchema = z.array(z.object({
    shouldDelete: z.boolean().optional(),
    reportId: z.uuid().optional(),
    reportName: z.string().optional(),
    reportLink: z.url().optional(),
})).optional().refine((reports) => {
    if (!reports || reports.length === 0) return true;

    return reports.every((report) => {
        // A report can either be deleted (reportId) or created (reportName + reportLink)
        if (report.shouldDelete === true && !report.reportId) return false;
        if (report.reportId && !report.shouldDelete) return false;
        if (report.reportName && !report.reportLink) return false;
        if (report.reportLink && !report.reportName) return false;
        return true;
    });
}, {
    message: "Invalid medical report data. If shouldDelete is true, reportId must be provided. If reportName is provided, reportLink must also be provided and vice versa."
});

export const updatePatientProfileZodSchema = z.object({
    patientInfo: patientInfoZodSchema.optional(),
    patientHealthData: patientHealthDataZodSchema.optional(),
    medicalReports: medicalReportsZodSchema,
});

// Admins update a patient by id. Medical reports are managed by the patient, not the admin.
export const updatePatientByAdminZodSchema = z.object({
    patientInfo: patientInfoZodSchema.optional(),
    patientHealthData: patientHealthDataZodSchema.optional(),
});

export const PatientValidation = {
    updatePatientProfileZodSchema,
    updatePatientByAdminZodSchema,
};
