import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import {
    getMeController,
    loginUserController,
    registerPatientController,
    changePasswordController,
    getNewTokenController,
    logoutUserController
} from "./controllers";



const router = Router();


router.post("/register", registerPatientController);

router.post("/login", loginUserController);

router.get('/me',
    checkAuth(Role.ADMIN, Role.DOCTOR, Role.SUPER_ADMIN, Role.PATIENT),
    getMeController
)

router.post(
    '/refresh-token',
    getNewTokenController
)

router.post(
    '/change-password',
    checkAuth(Role.ADMIN, Role.DOCTOR, Role.SUPER_ADMIN, Role.PATIENT),
    changePasswordController
)

router.post(
    '/logout',
    checkAuth(Role.ADMIN, Role.DOCTOR, Role.SUPER_ADMIN, Role.PATIENT),
    logoutUserController
)

export const AuthRoutes = router;