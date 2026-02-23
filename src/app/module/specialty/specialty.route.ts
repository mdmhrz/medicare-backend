import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";


import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router()

// route
//1. create specialty
router.post(
    '/',
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
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