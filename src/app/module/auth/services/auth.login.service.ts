import { UserStatus } from "../../../../generated/prisma/enums";
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

    if (data?.user?.status === UserStatus.DELETED || data?.user?.isDeleted) {
        throw new Error("Your account has been deleted. Please contact support.");
    }

    return data;
}

export default loginUserService;