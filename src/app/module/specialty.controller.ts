import { Request, Response } from "express";
import { SpecialtyService } from "./specialty.service";

const createSpecialty = async (req: Request, res: Response) => {

    try {
        const payload = req.body;
        const specialty = await SpecialtyService.createSpecialty(payload);
        res.status(201).json({
            success: true,
            message: "Specialty created successfully",
            data: specialty
        });
    } catch (error) {
        console.error("Error creating specialty:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create specialty",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }

}


const getAllSpecialties = async (req: Request, res: Response) => {
    try {
        const specialties = await SpecialtyService.getAllSpecialties();
        res.status(200).json({
            success: true,
            message: "Specialties retrieved successfully",
            data: specialties
        });
    } catch (error) {
        console.error("Error retrieving specialties:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve specialties",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}



const updateSpecialtyById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const payload = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Specialty ID is required"
            });
        }

        const result = await SpecialtyService.updateSpecialtyById(id as string, payload);
        res.status(200).json({
            success: true,
            message: "Specialty updated successfully",
            data: result
        });
    } catch (error) {
        console.error("Error updating specialty:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update specialty",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}







const deleteSpecialtyById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Specialty ID is required"
            });
        }

        const result = await SpecialtyService.deleteSpecialtyById(id as string);
        res.status(200).json({
            success: true,
            message: "Specialty deleted successfully",
            data: result
        });
    } catch (error) {
        console.error("Error deleting specialty:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete specialty",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}






export const SpecialtyController = {
    createSpecialty,
    getAllSpecialties,
    updateSpecialtyById,
    deleteSpecialtyById
}