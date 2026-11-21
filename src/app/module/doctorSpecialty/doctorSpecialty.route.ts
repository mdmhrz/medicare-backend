import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { DoctorSpecialtyController } from "./doctorSpecialty.controller";
import { DoctorSpecialtyValidation } from "./doctorSpecialty.validation";

const router = Router();

router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DoctorSpecialtyController.getAllDoctorSpecialties
);

router.get(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DoctorSpecialtyController.getDoctorSpecialtyById
);

router.post(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(DoctorSpecialtyValidation.createDoctorSpecialtyZodSchema),
    DoctorSpecialtyController.createDoctorSpecialty
);

router.delete(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DoctorSpecialtyController.deleteDoctorSpecialty
);

export const DoctorSpecialtyRoutes = router;
