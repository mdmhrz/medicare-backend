import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodSchema: z.ZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const parsedResult = zodSchema.safeParse(req.body);
        if (!parsedResult.success) {
            console.log("Zod validation error", parsedResult.error);
            next(parsedResult.error);
            return;
        }

        // sanitizing the payload
        req.body = parsedResult.data;

        next();
    }
}