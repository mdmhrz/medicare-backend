import dotenv from "dotenv";
import AppError from "../errorHelper/AppError";
import status from "http-status";
dotenv.config({ quiet: true });


interface EnvConfig {
    NODE_ENV: string;
    PORT: string;
    DATABASE_URL: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    APP_URL: string;
}

const loadEnvVariables = (): EnvConfig => {

    const requiredVars = [
        "NODE_ENV",
        "PORT",
        "DATABASE_URL",
        "BETTER_AUTH_SECRET",
        "BETTER_AUTH_URL",
        "APP_URL"
    ];

    requiredVars.forEach((varName) => {
        if (!process.env[varName]) {
            throw new AppError(status.INTERNAL_SERVER_ERROR, `Environment variable ${varName} is required but not defined.`);
        }
    });


    return {
        NODE_ENV: process.env.NODE_ENV as string,
        PORT: process.env.PORT as string,
        DATABASE_URL: process.env.DATABASE_URL as string,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
        APP_URL: process.env.APP_URL as string
    }
}

export const envVars = loadEnvVariables();

