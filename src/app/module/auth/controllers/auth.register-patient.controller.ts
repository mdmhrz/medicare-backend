import { Request, Response } from "express";
import { catchAsync } from "../../../shared/catchAsync";
import { tokenUtils } from "../../../utils/token";
import { sendResponse } from "../../../shared/sendResponse";
import status from "http-status";
import registerPatientService from "../services/auth.register.service";


export const registerPatientController = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await registerPatientService(payload);
        const { accessToken, refreshToken, token, ...rest } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);


        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Patient registered successfully",
            data: {
                ...rest,
                token,
                accessToken,
                refreshToken
            },
        })
    }
);