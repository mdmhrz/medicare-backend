import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { SpecialtyService } from "./specialty.service";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
    const payload = {
        ...req.body,
        icon: req.file?.path ?? req.body.icon,
    };

    const specialty = await SpecialtyService.createSpecialty(payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Specialty created successfully",
        data: specialty,
    });
});

const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
    const result = await SpecialtyService.getAllSpecialties(req.query as IQueryParams);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Specialties retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const updateSpecialtyById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    const updatedSpecialty = await SpecialtyService.updateSpecialtyById(id as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Specialty updated successfully",
        data: updatedSpecialty,
    });
});

const deleteSpecialtyById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedSpecialty = await SpecialtyService.deleteSpecialtyById(id as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Specialty deleted successfully",
        data: deletedSpecialty,
    });
});

export const SpecialtyController = {
    createSpecialty,
    getAllSpecialties,
    updateSpecialtyById,
    deleteSpecialtyById,
};
