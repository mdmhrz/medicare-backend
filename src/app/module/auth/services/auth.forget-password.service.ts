import status from "http-status";
import AppError from "../../../errorHelper/AppError";
import { prisma } from "../../../lib/prisma";
import { UserStatus } from "../../../../generated/prisma/enums";
import { auth } from "../../../lib/auth";

export const forgetPasswordService = async (email: string) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if (!isUserExist.emailVerified) {
        throw new AppError(status.BAD_REQUEST, "Email is not verified");
    }

    if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
        throw new AppError(status.BAD_REQUEST, "User is deleted");
    }


    await auth.api.requestPasswordResetEmailOTP({
        body: {
            email
        }
    })
}