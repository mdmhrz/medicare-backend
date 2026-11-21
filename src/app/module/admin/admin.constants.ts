import { Prisma } from "../../../generated/prisma/client";

export const adminSearchableFields = [
    "name",
    "email",
    "contactNumber",
];

export const adminFilterableFields = [
    "user.role",
    "user.status",
];

/**
 * Public API aliases: /admins?role=SUPER_ADMIN&status=ACTIVE
 */
export const adminFilterAliases: Record<string, string> = {
    role: "user.role",
    status: "user.status",
};

export const adminIncludeConfig: Prisma.AdminInclude = {
    user: true,
};
