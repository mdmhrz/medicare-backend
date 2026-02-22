import status from "http-status";
import { Role, Specialty } from "../../../../generated/prisma/client";
import AppError from "../../../errorHelper/AppError";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { ICreateDoctorPayload } from ".././user.interface";

const createDoctorService = async (payload: ICreateDoctorPayload) => {

    const specialties: Specialty[] = [];

    for (const specialtyId of payload.specialties) {
        const specialty = await prisma.specialty.findUnique({
            where: {
                id: specialtyId
            }
        });

        if (!specialty) {
            throw new AppError(status.NOT_FOUND, `Specialty with id ${specialtyId} not found`);
        }

        specialties.push(specialty);
    }


    //isUserExist
    const isUserExist = await prisma.doctor.findUnique({
        where: {
            email: payload.doctor.email
        }
    });

    if (isUserExist) {
        throw new AppError(status.BAD_REQUEST, "User already exist");
    }


    const userData = await auth.api.signUpEmail({
        body: {
            email: payload.doctor.email,
            password: payload.password,
            name: payload.doctor.name,
            role: Role.DOCTOR,
            needPasswordChange: true
        }
    })


    try {

        const result = await prisma.$transaction(async (tx) => {
            const doctorData = await tx.doctor.create({
                data: {
                    userId: userData.user.id,
                    ...payload.doctor
                }
            });


            const doctorSpecialtyData = specialties.map((specialty) => {
                return {
                    doctorId: doctorData.id,
                    specialtyId: specialty.id
                }
            })

            await tx.doctorSpecialty.createMany({
                data: doctorSpecialtyData
            })


            const doctor = await tx.doctor.findUnique({
                where: {
                    id: doctorData.id
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    registrationNumber: true,
                    experience: true,
                    gender: true,
                    appoinmentFee: true,
                    qualification: true,
                    currentWorkingPlace: true,
                    designation: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            status: true,
                            isDeleted: true,
                            deletedAt: true,
                            image: true,
                            emailVerified: true,
                            needPasswordChange: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    },
                    specialties: {
                        select: {
                            specialty: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    }

                }
            })



            return doctor;
        })


        return result

    } catch (error) {
        console.error("Error creating doctor: ", error);
        // Rollback user creation if doctor creation fails
        await prisma.user.delete({
            where: {
                id: userData.user.id
            }
        });
        throw error;
    }
}

export default createDoctorService;