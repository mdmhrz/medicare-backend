import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();


router.post("/register", authController.registerPatient);

router.post("/login", authController.loginUser);

router.get('/me',
    checkAuth(Role.ADMIN, Role.DOCTOR, Role.SUPER_ADMIN, Role.PATIENT),
    authController.getMe
)

router.post(
    '/refresh-token',
    authController.getNewTokenController
)

router.post(
    '/change-password',
    checkAuth(Role.ADMIN, Role.DOCTOR, Role.SUPER_ADMIN, Role.PATIENT),
    authController.changePassword
)

export const AuthRoutes = router;