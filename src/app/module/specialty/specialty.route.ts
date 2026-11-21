import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { SpecialtyController } from "./specialty.controller";
import { SpecialtyValidation } from "./specialty.validation";

const router = Router();

// 1. create specialty (multipart file upload or JSON with an icon URL)
router.post(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("file"),
    validateRequest(SpecialtyValidation.createSpecialtyZodSchema),
    SpecialtyController.createSpecialty
);

// 2. get all specialties (public: used by doctor forms and the public site)
router.get(
    "/",
    SpecialtyController.getAllSpecialties
);

// 3. update specialty
router.put(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(SpecialtyValidation.updateSpecialtyZodSchema),
    SpecialtyController.updateSpecialtyById
);

// 4. delete specialty
router.delete(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    SpecialtyController.deleteSpecialtyById
);

export const SpecialtyRoutes = router;
