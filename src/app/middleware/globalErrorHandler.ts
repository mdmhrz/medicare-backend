/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";

export const globalErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === "development") {
        console.error("Global Error Handler:", error);
    }


    const statusCode: number = status.INTERNAL_SERVER_ERROR;
    const message: string = "Internal Server Error";


    res.status(statusCode).json({
        success: false,
        message: message,
        error: error instanceof Error ? error.message : "Unknown error"
    })

}


