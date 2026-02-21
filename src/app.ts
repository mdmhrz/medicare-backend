import express, { Application, Request, Response } from "express";
import { SpecialtyRoutes } from "./app/module/specialty.route";
import { IndexRoutes } from "./app/routes";


export const app: Application = express()

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());


// Importing routes
app.use('/api/v1', IndexRoutes)


// Basic route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript + Express!');
});