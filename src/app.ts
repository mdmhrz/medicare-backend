/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import { requestLogger } from "./app/middleware/requestLogger";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import { envVars } from "./app/config/env";
import cors from "cors";
import qs from "qs";
import { PaymentController } from "./app/module/payment/payment.controller";
import cron from "node-cron";
import { AppointmentService } from "./app/module/appointment/appointment.service";

export const app: Application = express();

app.set("query parser", (str: string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "src/app/templates"));

// webhook
app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent);

app.use("/api/auth", toNodeHandler(auth));

app.use(cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Request Logger - early in chain to capture all requests
app.use(requestLogger);

// Serve public static files
app.use(express.static(path.resolve(process.cwd(), 'public')));

// Basic route - Serve landing page
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.resolve(process.cwd(), 'public/index.html'));
});

// Cron Job
cron.schedule('*/25 * * * *', async () => {
    try {
        console.log('running a task every day at midnight');
        await AppointmentService.cancelUnpaidAppointments();
    } catch (error: any) {
        console.error(`Error occoured while running cron job: ${error}, error stack: ${error?.message}`);
    }
});

// Importing routes
app.use('/api/v1', IndexRoutes);

// Not found middleware
app.use(notFound);

// Global error handling middleware
app.use(globalErrorHandler);







