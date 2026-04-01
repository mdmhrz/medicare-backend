import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createDoctorZodSchema } from "./user.validation";


const router = Router();


router.post(
    // route
    "/create-doctor",

    // validation middleware
    validateRequest(createDoctorZodSchema),

    // controller
    UserController.createDoctor
);




export const UserRoutes = router;