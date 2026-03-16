/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";
import { handleZodError } from "../errorHelper/handleZodError";
import { env } from "node:process";
import AppError from "../errorHelper/AppError";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";
import { deleteUploadedFilesFromGlobalErrorHandler } from "../utils/deleteUploadedFilesFromGlobalErrorHandler";
import { Prisma } from "../../generated/prisma/client";
import { handlePrismaClientKnownRequestError, handlePrismaClientUnknownError, handlePrismaClientValidationError, handlerPrismaClientInitializationError, handlerPrismaClientRustPanicError } from "../errorHelper/handlePrismaErrors";



export const globalErrorHandler = async (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === "development") {
        console.error("Global Error Handler:", error);
    }

    await deleteUploadedFilesFromGlobalErrorHandler(req)


    let errorSources: TErrorSources[] = []
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal Server Error';
    let stack: string | undefined = undefined;



    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const simplifiedError = handlePrismaClientKnownRequestError(error)
        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = error.stack
    }
    else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        const simplifiedError = handlePrismaClientUnknownError(error);
        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = error.stack
    }
    else if (error instanceof Prisma.PrismaClientValidationError) {
        const simplifiedError = handlePrismaClientValidationError(error)
        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = error.stack
    }
    else if (error instanceof Prisma.PrismaClientRustPanicError) {
        const simplifiedError = handlerPrismaClientRustPanicError();
        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = error.stack
    }
    else if (error instanceof Prisma.PrismaClientInitializationError) {
        const simplifiedError = handlerPrismaClientInitializationError(error);
        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = error.stack
    }
    else if (error instanceof z.ZodError) {
        const simplifiedErrors = handleZodError(error);
        statusCode = simplifiedErrors.statusCode;
        message = simplifiedErrors.message;
        // stack = error.stack;
        errorSources.push(...simplifiedErrors.errorSources);
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
        errorSources,
        stack: envVars.NODE_ENV === "development" ? error.stack : undefined,
        error: envVars.NODE_ENV === "development" ? (error instanceof Error ? error.message : "Unknown error") : "Internal Server Error"
    }


    res.status(statusCode).json(errorResponse);

}


