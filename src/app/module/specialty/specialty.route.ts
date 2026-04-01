import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";


import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { SpecialtyValidation } from "./specialty.validation";

const router = Router()

// routes

//1. create specialty
router.post(
    '/',
    // checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single('file'),
    validateRequest(SpecialtyValidation.createSpecialtyZodSchema),
    SpecialtyController.createSpecialty
);

//2. get all specialties
router.get(
    '/',
    SpecialtyController.getAllSpecialties
);

//3. delete specialty
router.delete(
    '/:id',
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    SpecialtyController.deleteSpecialtyById
);

//4. update specialty
router.put(
    '/:id',
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    SpecialtyController.updateSpecialtyById
);



export const SpecialtyRoutes = router;