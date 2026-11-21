import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PatientService } from "./patient.service";

const getAllPatients = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.getAllPatients(req.query as IQueryParams);

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Patients fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getPatientById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await PatientService.getPatientById(id as string);

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Patient fetched successfully",
        data: result,
    });
});

const updatePatient = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    const result = await PatientService.updatePatient(id as string, payload);

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Patient updated successfully",
        data: result,
    });
});

const deletePatient = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await PatientService.deletePatient(id as string);

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: result.message,
        data: result,
    });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const payload = req.body;

    const result = await PatientService.updateMyProfile(user, payload);

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Profile updated successfully",
        data: result,
    });
});

export const PatientController = {
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    updateMyProfile,
};
