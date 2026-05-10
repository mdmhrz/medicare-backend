import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

// Ensure logs directory exists
const logsDir = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const getDateString = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
};

const successLogFilePath = () => {
    return path.join(logsDir, `success-${getDateString()}.log`);
};

const errorLogFilePath = () => {
    return path.join(logsDir, `error-${getDateString()}.log`);
};

interface LogEntry {
    timestamp: string;
    method: string;
    url: string;
    ip: string;
    userAgent: string;
    referer: string;
    status: number;
    responseTime: string;
    contentLength: number;
    userId: string;
    error?: string;
}

const writeLog = (entry: LogEntry, isError: boolean) => {
    const logLine = JSON.stringify(entry) + "\n";
    const filePath = isError ? errorLogFilePath() : successLogFilePath();
    fs.appendFile(filePath, logLine, (err) => {
        if (err) {
            console.error("Failed to write request log:", err);
        }
    });
};

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const startTime = Date.now();

    const originalEnd = res.end;
    // @ts-ignore
    res.end = function (...args: any[]) {
        const responseTime = Date.now() - startTime;
        const isError = res.statusCode >= 400;
        const userId = (req as any).user?.id || (req as any).userId || "-";

        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.socket.remoteAddress || "unknown",
            userAgent: req.get("user-agent") || "-",
            referer: req.get("referer") || "-",
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
            contentLength: parseInt(res.get("content-length") || "0", 10),
            userId,
            ...(isError && { error: (res as any).err?.message }),
        };

        writeLog(logEntry, isError);

        // @ts-ignore
        return originalEnd.apply(res, args);
    };

    next();
};

export default requestLogger;
