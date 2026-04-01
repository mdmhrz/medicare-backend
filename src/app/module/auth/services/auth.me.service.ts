
import { prisma } from "../../../lib/prisma";

export const getMeService = async (id: string) => {

    const isUserExist = await prisma.user.findUnique({
        where: {
            id
        },
        include: {
            patient: {
                include: {
                    appointments: true,
                    reviews: true,
                    prescriptions: true,
                    medicalReports: true,
                    patientHealthData: true
                }
            },
            doctor: {
                include: {
                    specialties: true,
                    appointments: true,
                    reviews: true,
                    prescriptions: true
                }
            },
            admin: true
        }
    })

    if (!isUserExist) {
        throw new Error("User not found");
    }

    return isUserExist
}


