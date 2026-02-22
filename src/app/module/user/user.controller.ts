import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import createDoctorService from "./services/user.createDoctor.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";


const createDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        const result = await createDoctorService(payload);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Doctor registered successfully",
            data: result
        })

    }
)


export const UserController = {
    createDoctor
}






