import { Request, Response } from "express";
import status from "http-status";

const notFound = (req: Request, res: Response) => {
    res.status(status.NOT_FOUND).json({
        success: false,
        statusCode: status.NOT_FOUND,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        errorCode: "ROUTE_NOT_FOUND",
        method: req.method,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
    });
}

export default notFound;