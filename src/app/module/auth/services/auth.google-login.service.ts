import { prisma } from "../../../lib/prisma"
import { tokenUtils } from "../../../utils/token";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const googleLoginService = async (session: Record<string, any>) => {
    const isPatientExist = await prisma.patient.findUnique({
        where: {
            userId: session.user.id
        }
    });


    if (!isPatientExist) {
        await prisma.patient.create({
            data: {
                userId: session.user.id,
                name: session.user.name,
                email: session.user.email
            }
        })
    }

    const accessToken = tokenUtils.getAccessToken({
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
    });

    return {
        accessToken,
        refreshToken
    }
}