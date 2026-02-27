/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/erro.interface";
import { handleZodError } from "../errorHelper/handleZodError";
import { env } from "node:process";
import AppError from "../errorHelper/AppError";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";



export const globalErrorHandler = async (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === "development") {
        console.error("Global Error Handler:", error);
    }

    // this is for cloudinary files delete if error
    if (req.file && req.file.path) {
        await deleteFileFromCloudinary(req.file.path);
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const imageUrls = req.files.map(file => file.path);
        await Promise.all(imageUrls.map(url => deleteFileFromCloudinary(url)));
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
        stack: envVars.NODE_ENV === "development" ? error.stack : undefined,
        error: envVars.NODE_ENV === "development" ? (error instanceof Error ? error.message : "Unknown error") : "Internal Server Error"
    }


    res.status(statusCode).json(errorResponse);

}


