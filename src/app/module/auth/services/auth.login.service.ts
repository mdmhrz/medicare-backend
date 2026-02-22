import status from "http-status";
import { UserStatus } from "../../../../generated/prisma/enums";
import AppError from "../../../errorHelper/AppError";
import { auth } from "../../../lib/auth";

interface ILoginPatientPayload {
    email: string;
    password: string;
}

const loginUserService = async (payload: ILoginPatientPayload) => {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })

    if (data?.user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, "Your account has been blocked. Please contact support.");
    }


    if (data?.user?.status === UserStatus.DELETED || data?.user?.isDeleted) {
        throw new AppError(status.GONE, "Your account has been deleted. Please contact support.");
    }

    return data;
}

export default loginUserService;