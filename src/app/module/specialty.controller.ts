import { Request, Response } from "express";
import { SpecialtyService } from "./specialty.service";
import { catchAsync } from "../shared/catchAsync";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const specialty = await SpecialtyService.createSpecialty(payload);
    res.status(201).json({
        success: true,
        message: "Specialty created successfully",
        data: specialty
    });
});



const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
    const specialties = await SpecialtyService.getAllSpecialties();
    res.status(200).json({
        success: true,
        message: "Specialties retrieved successfully",
        data: specialties
    });
});



const updateSpecialtyById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    const updatedSpecialty = await SpecialtyService.updateSpecialtyById(id as string, payload);
    res.status(200).json({
        success: true,
        message: "Specialty updated successfully",
        data: updatedSpecialty
    });
});




const deleteSpecialtyById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedSpecialty = await SpecialtyService.deleteSpecialtyById(id as string);
    res.status(200).json({
        success: true,
        message: "Specialty deleted successfully",
        data: deletedSpecialty
    });
});




export const SpecialtyController = {
    createSpecialty,
    getAllSpecialties,
    updateSpecialtyById,
    deleteSpecialtyById
}