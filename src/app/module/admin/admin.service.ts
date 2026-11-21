import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { Admin, Prisma } from "../../../generated/prisma/client";
import AppError from "../../errorHelper/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/queryBuilder";
import {
    adminFilterAliases,
    adminFilterableFields,
    adminSearchableFields,
} from "./admin.constants";
import { IChangeUserRolePayload, IChangeUserStatusPayload, IUpdateAdminPayload } from "./admin.interface";

const normalizeAdminQuery = (query: IQueryParams): IQueryParams => {
    const normalized: IQueryParams = { ...query };

    for (const [alias, field] of Object.entries(adminFilterAliases)) {
        const value = normalized[alias];

        if (value !== undefined && value !== "") {
            normalized[field] = value;
            delete normalized[alias];
        }
    }

    return normalized;
};

const getAllAdmins = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<Admin, Prisma.AdminWhereInput, Prisma.AdminInclude>(
        prisma.admin,
        normalizeAdminQuery(query),
        {
            searchableFields: adminSearchableFields,
            filterableFields: adminFilterableFields,
        }
    );

    return queryBuilder
        .search()
        .filter()
        .where({
            isDeleted: false,
        })
        .include({
            user: true,
        })
        .paginate()
        .sort()
        .fields()
        .execute();
};

const getAdminById = async (id: string) => {
    const admin = await prisma.admin.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            user: true,
        },
    });

    if (!admin) {
        throw new AppError(status.NOT_FOUND, "Admin Or Super Admin not found");
    }

    return admin;
};

const updateAdmin = async (id: string, payload: IUpdateAdminPayload) => {
    const existingAdmin = await prisma.admin.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        select: {
            id: true,
            userId: true,
            name: true,
            profilePhoto: true,
        },
    });

    if (!existingAdmin) {
        throw new AppError(status.NOT_FOUND, "Admin Or Super Admin not found");
    }

    if (!payload.admin || Object.keys(payload.admin).length === 0) {
        throw new AppError(status.BAD_REQUEST, "No data provided to update");
    }

    await prisma.$transaction(async (tx) => {
        await tx.admin.update({
            where: { id },
            data: {
                ...payload.admin,
            },
        });

        if (payload.admin?.name || payload.admin?.profilePhoto) {
            await tx.user.update({
                where: { id: existingAdmin.userId },
                data: {
                    name: payload.admin.name ?? existingAdmin.name,
                    image: payload.admin.profilePhoto ?? existingAdmin.profilePhoto,
                },
            });
        }
    });

    return getAdminById(id);
};

// Soft delete the admin and revoke their access. An admin cannot delete themselves.
const deleteAdmin = async (id: string, user: IRequestUser) => {
    const existingAdmin = await prisma.admin.findFirst({
        where: {
            id,
            isDeleted: false,
        },
    });

    if (!existingAdmin) {
        throw new AppError(status.NOT_FOUND, "Admin Or Super Admin not found");
    }

    if (existingAdmin.userId === user.userId) {
        throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
    }

    await prisma.$transaction(async (tx) => {
        await tx.admin.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

        await tx.user.update({
            where: { id: existingAdmin.userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.DELETED,
            },
        });

        await tx.session.deleteMany({
            where: { userId: existingAdmin.userId },
        });

        await tx.account.deleteMany({
            where: { userId: existingAdmin.userId },
        });
    });

    return { message: "Admin deleted successfully" };
};

const changeUserStatus = async (user: IRequestUser, payload: IChangeUserStatusPayload) => {
    // 1. Super admin can change the status of any user (admin, doctor, patient). Except himself.
    // 2. Admin can change the status of doctor and patient. Except himself. He cannot change the status of super admin and other admin user.

    const isAdminExists = await prisma.admin.findUniqueOrThrow({
        where: {
            email: user.email,
        },
        include: {
            user: true,
        },
    });

    const { userId, userStatus } = payload;

    const userToChangeStatus = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        },
    });

    const selfStatusChange = isAdminExists.userId === userId;

    if (selfStatusChange) {
        throw new AppError(status.BAD_REQUEST, "You cannot change your own status");
    }

    if (isAdminExists.user.role === Role.ADMIN && userToChangeStatus.role === Role.SUPER_ADMIN) {
        throw new AppError(status.BAD_REQUEST, "You cannot change the status of super admin. Only super admin can change the status of another super admin");
    }

    if (isAdminExists.user.role === Role.ADMIN && userToChangeStatus.role === Role.ADMIN) {
        throw new AppError(status.BAD_REQUEST, "You cannot change the status of another admin. Only super admin can change the status of another admin");
    }

    if (userStatus === UserStatus.DELETED) {
        throw new AppError(status.BAD_REQUEST, "You cannot set user status to deleted. To delete a user, you have to use role specific delete api. For example, to delete an doctor user, you have to use delete doctor api which will set the user status to deleted and also set isDeleted to true and also delete the user session and account");
    }

    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            status: userStatus,
        },
    });
};

const changeUserRole = async (user: IRequestUser, payload: IChangeUserRolePayload) => {
    // 1. Super admin can change the role of only other super admin and admin user. He cannot change his own role.
    // 2. Admin cannot change role of any user
    // 3. Role of Patient and Doctor user cannot be changed by anyone.

    const isSuperAdminExists = await prisma.admin.findFirstOrThrow({
        where: {
            email: user.email,
            user: {
                role: Role.SUPER_ADMIN,
            },
        },
        include: {
            user: true,
        },
    });

    const { userId, role } = payload;

    const userToChangeRole = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        },
    });

    const selfRoleChange = isSuperAdminExists.userId === userId;

    if (selfRoleChange) {
        throw new AppError(status.BAD_REQUEST, "You cannot change your own role");
    }

    if (userToChangeRole.role === Role.DOCTOR || userToChangeRole.role === Role.PATIENT) {
        throw new AppError(status.BAD_REQUEST, "You cannot change the role of doctor or patient user. If you want to change the role of doctor or patient user, you have to delete the user and recreate with new role");
    }

    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            role,
        },
    });
};

export const AdminService = {
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    changeUserStatus,
    changeUserRole,
};
