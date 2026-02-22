import status from "http-status";
import AppError from "../../../errorHelper/AppError";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";


interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
}

const registerPatientService = async (payload: IRegisterPatientPayload) => {
    const { name, email, password } = payload;

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
        }
    })

    if (!data.user) {
        throw new AppError(status.BAD_REQUEST, "Failed to register patient");
    }


    // Create patient record and link to user record
    try {
        const patient = await prisma.$transaction(async (tx) => {
            const patientTx = await tx.patient.create({
                data: {
                    userId: data.user.id,
                    name: payload.name,
                    email: payload.email
                }
            })

            return patientTx;
        })

        return { ...data, patient };
    } catch (error) {
        console.error("Transactional Error creating patient record:", error);

        // rollback user creation in Better Auth
        await prisma.user.delete({
            where: { id: data.user.id }
        })

        throw error
    }

}

export default registerPatientService;

