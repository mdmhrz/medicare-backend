import { Role } from "../../generated/prisma/enums"
import { envVars } from "../config/env";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedSuperAdmin = async () => {
    try {
        console.log('Seeding super admin started');
        // is super admin exist
        const isSuperAdminExist = await prisma.user.findFirst({
            where: {
                role: Role.SUPER_ADMIN
            }
        });

        if (isSuperAdminExist) {
            console.log('Super admin already exist');
            return;
        }

        //create super admin
        console.log(`*** Creating super admin`);
        const superAdminUser = await auth.api.signUpEmail({
            body: {
                name: "Super Admin",
                email: `${envVars.SUPER_ADMIN_EMAIL}`,
                password: `${envVars.SUPER_ADMIN_PASSWORD}`,
                role: Role.SUPER_ADMIN,
                needPasswordChange: false,
                rememberMe: false,
            }
        })

        await prisma.$transaction(async (tx) => {
            // make email verified true
            console.log(`Updating super admin email verified to true`);
            await tx.user.update({
                where: { id: superAdminUser.user.id },
                data: {
                    emailVerified: true
                },
            });

            // create super admin
            console.log(`Creating super admin in admin table`);
            await tx.admin.create({
                data: {
                    userId: superAdminUser.user.id,
                    name: superAdminUser.user.name,
                    email: superAdminUser.user.email,
                }
            })
        })

        console.log('Seeding super admin completed');
        // return superAdminUser

        const superAdmin = await prisma.admin.findFirst({
            where: {
                email: `${envVars.SUPER_ADMIN_EMAIL}`
            },
            include: {
                user: true,
            }
        })

        console.log("Congrats! Super Admin Created Successfully");
        console.log(superAdmin);


    } catch (error) {
        console.error("Error seeding super admin", error);

        // delete super admin from user table     
        console.log("Deleting super admin from user table");
        await prisma.user.delete({
            where: {
                email: `${envVars.SUPER_ADMIN_EMAIL}`
            }
        })
    }
}