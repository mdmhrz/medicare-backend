import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import registerPatientService from "./services/auth.register.service";
import loginUserService from "./services/auth.login.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import { getMeService } from "./services/auth.me.service";
import AppError from "../../errorHelper/AppError";
import { getNewToken } from "../../utils/getNewToken";

const registerPatient = catchAsync(
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



const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await loginUserService(payload);
        const { accessToken, refreshToken, token, ...rest } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token);


        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged in successfully",
            data: {
                ...rest,
                token,
                accessToken,
                refreshToken
            },
        })
    }
)

const getMe = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            throw new Error("Request User not found");
        }

        const result = await getMeService(user.userId)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User fetched successfully",
            data: result
        })
    }
)



const getNewTokenController = catchAsync(
    async (req: Request, res: Response) => {



        const refreshToken = req.cookies.refreshToken;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];


        console.log({
            refreshToken,
            betterAuthSessionToken
        })

        if (!refreshToken && !betterAuthSessionToken) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorized access! no refresh token provided");
        }

        const result = await getNewToken(refreshToken, betterAuthSessionToken);

        const {
            sessionToken,
            accessToken,
            refreshToken: newRefreshToken
        } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, sessionToken);


        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged in successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                sessionToken
            },
        })

    }
)


export const authController = {
    registerPatient,
    loginUser,
    getMe,
    getNewTokenController
}