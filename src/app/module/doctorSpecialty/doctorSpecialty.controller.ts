import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { DoctorSpecialtyService } from "./doctorSpecialty.service";

const getAllDoctorSpecialties = catchAsync(async (req: Request, res: Response) => {
    const result = await DoctorSpecialtyService.getAllDoctorSpecialties(req.query as IQueryParams);

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Doctor specialties retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getDoctorSpecialtyById = catchAsync(async (req: Request, res: Response) => {
    const doctorSpecialty = await DoctorSpecialtyService.getDoctorSpecialtyById(req.params.id as string);

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Doctor specialty retrieved successfully",
        data: doctorSpecialty,
    });
});

const createDoctorSpecialty = catchAsync(async (req: Request, res: Response) => {
    const doctorSpecialty = await DoctorSpecialtyService.createDoctorSpecialty(req.body);

    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: "Specialty assigned to doctor successfully",
        data: doctorSpecialty,
    });
});

const deleteDoctorSpecialty = catchAsync(async (req: Request, res: Response) => {
    const result = await DoctorSpecialtyService.deleteDoctorSpecialty(req.params.id as string);

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: result.message,
        data: result,
    });
});

export const DoctorSpecialtyController = {
    getAllDoctorSpecialties,
    getDoctorSpecialtyById,
    createDoctorSpecialty,
    deleteDoctorSpecialty,
};
