import status from "http-status";
import AppError from "../../../errorHelper/AppError";
import { prisma } from "../../../lib/prisma"
import { UserStatus } from "../../../../generated/prisma/enums";
import { auth } from "../../../lib/auth";

export const resetPasswordService = async (email: string, otp: string, newPassword: string) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    //check here if user google authenticated by grabing user id from email
    const isGoogleAuthenticatedUser = await prisma.account.findFirst({
        where: {
            userId: isUserExist.id,
            providerId: "google"
        }
    })

    if (isGoogleAuthenticatedUser) {
        throw new AppError(status.BAD_REQUEST, "Google authenticated users can not reset password");
    }


    if (!isUserExist.emailVerified) {
        throw new AppError(status.BAD_REQUEST, "Email is not verified");
    }

    if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
        throw new AppError(status.BAD_REQUEST, "User is deleted");
    }



    await auth.api.resetPasswordEmailOTP({
        body: {
            email,
            otp,
            password: newPassword
        }
    })


    // check if user needpasswordChage is true
    if (isUserExist.needPasswordChange) {
        await prisma.user.update({
            where: {
                id: isUserExist.id
            },
            data: {
                needPasswordChange: false
            }
        })
    }

    await prisma.session.deleteMany({
        where: {
            userId: isUserExist.id
        }
    })


}