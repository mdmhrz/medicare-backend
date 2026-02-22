/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/erro.interface";
import { handleZodError } from "../errorHelper/handleZodError";
import { env } from "node:process";
import AppError from "../errorHelper/AppError";



export const globalErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === "development") {
        console.error("Global Error Handler:", error);
    }

    const errorSource: TErrorSources[] = []
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = "Internal Server Error";
    // let stack: string | undefined = undefined;

    if (error instanceof z.ZodError) {
        const simplifiedErrors = handleZodError(error);
        statusCode = simplifiedErrors.statusCode;
        message = simplifiedErrors.message;
        // stack = error.stack;
        errorSource.push(...simplifiedErrors.errorSources);
    } else if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        // stack = error.stack;
    } else if (error instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = error.message;
        // stack = error.stack;
    }

    const errorResponse: TErrorResponse = {
        success: false,
        message,
        errorSource,
        // stack: envVars.NODE_ENV === "development" ? stack : undefined,
        error: envVars.NODE_ENV === "development" ? (error instanceof Error ? error.message : "Unknown error") : "Internal Server Error"
    }


    res.status(statusCode).json(errorResponse);

}


