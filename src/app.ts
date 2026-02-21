import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";


export const app: Application = express()

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript + Express!');
});

// Importing routes
app.use('/api/v1', IndexRoutes)


// Not found middleware
app.use(notFound);


// Global error handling middleware
app.use(globalErrorHandler);






