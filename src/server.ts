
import { Server } from "http";
import { app } from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seed";

let server: Server;

const bootStrap = async () => {
    try {
        await seedSuperAdmin();
        server = app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });
    } catch (err) {
        console.error("Failed to start the server:", err);
    }
}


//uncaught exception handler
process.on('uncaughtException', (error) => {
    console.log("Uncaught Exception Detected... Shutting down server", error);

    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }

    process.exit(1);
})


//unhandled rejection handler

process.on("unhandledRejection", (error) => {
    console.log("Unhandled Rejection Detected... Shutting down server", error);

    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }

    process.exit(1);
})

bootStrap();