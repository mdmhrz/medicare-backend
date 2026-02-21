import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import registerPatientService from "./services/auth.register.service";
import loginUserService from "./services/auth.login.service";
import status from "http-status";

const registerPatient = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const reuslt = await registerPatientService(payload);
        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Patient registered successfully",
            data: reuslt,
        })
    }
);



const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const reuslt = await loginUserService(payload);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged in successfully",
            data: reuslt,
        })
    }
)


export const authController = {
    registerPatient,
    loginUser
}