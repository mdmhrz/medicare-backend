import status from "http-status";
import AppError from "../../../errorHelper/AppError";
import { auth } from "../../../lib/auth";
import { IChangePasswordPayload } from "../interfaces/auth.interface";
import { tokenUtils } from "../../../utils/token";
import { prisma } from "../../../lib/prisma";

export const changePasswordService = async (payload: IChangePasswordPayload, sessionToken: string) => {
    const session = await auth.api.getSession({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })

    if (!session) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! Invalid session token");
    }

    const { currentPassword, newPassword } = payload;

    const result = await auth.api.changePassword({
        body: {
            currentPassword,
            newPassword,
            revokeOtherSessions: true
        },
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })

    if (session.user.needPasswordChange) {
        await prisma.user.update({
            where: {
                id: session.user.id
            },
            data: {
                needPasswordChange: false
            }
        })
    }




    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified
    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified
    })


    return {
        ...result,
        accessToken,
        refreshToken
    }
}