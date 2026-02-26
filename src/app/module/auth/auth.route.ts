import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import {
    getMeController,
    loginUserController,
    registerPatientController,
    changePasswordController,
    getNewTokenController,
    logoutUserController,
    verifyEmailController,
    forgetPasswordController,
    resetPasswordController,
    googleLoginController,
    googleLoginSuccessController,
    handleOAuthErrorController
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

router.post(
    '/verify-email',
    verifyEmailController
)

router.post(
    '/forget-password',
    forgetPasswordController
)

router.post(
    '/reset-password',
    resetPasswordController
)

// google auth
router.get('/login/google', googleLoginController);
router.get('/google/success', googleLoginSuccessController);
router.get('/oauth/error', handleOAuthErrorController);




export const AuthRoutes = router;