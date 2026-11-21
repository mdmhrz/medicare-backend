import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PatientController } from "./patient.controller";
import { updateMyPatientProfileMiddleware } from "./patient.middleware";
import { PatientValidation } from "./patient.validation";

const router = Router();

// Patient self-service (must stay above /:id routes)
router.patch("/update-my-profile",
    checkAuth(Role.PATIENT),
    multerUpload.fields([
        { name: "profilePhoto", maxCount: 1 },
        { name: "medicalReports", maxCount: 5 }
    ]),
    updateMyPatientProfileMiddleware,
    validateRequest(PatientValidation.updatePatientProfileZodSchema),
    PatientController.updateMyProfile
);

// Admin patient management
router.get("/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    PatientController.getAllPatients
);

router.get("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    PatientController.getPatientById
);

router.patch("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(PatientValidation.updatePatientByAdminZodSchema),
    PatientController.updatePatient
);

router.delete("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    PatientController.deletePatient
);

export const PatientRoutes = router;
