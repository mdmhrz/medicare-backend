import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const config = {
    port: process.env.PORT || 5000,
    databaseUrl: process.env.DATABASE_URL || "postgresql://admin:admin@localhost:5432/medicare-db?schema=public",
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || "better_auth_secret_key",
    betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:5000",
    appUrl: process.env.APP_URL || "http://localhost:3000"

};