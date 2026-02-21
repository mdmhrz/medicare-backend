import { auth } from "../../../lib/auth";


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
        throw new Error("Failed to register patient");
    }


    // TODO: Create patient record and link to user record
    // const patient = await prisma.$transaction(async (tx) => {
    //     const patient = await tx.patient.create({
    //         data: {
    //             userId: data.user.id,
    //         }
    //     }
    //     );

    //     await tx.user.update({
    //         where: {
    //             id: data.user.id,
    //         },
    //         data: {
    //             patientId: patient.id,
    //         }
    //     })

    //     return patient;
    // }

    return data

}

export default registerPatientService;

