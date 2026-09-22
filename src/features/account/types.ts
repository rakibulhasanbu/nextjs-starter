import { UserRole } from "@/features/auth/types";

export enum AccountStatus {
    PENDING_VERIFICATION = "PENDING_VERIFICATION",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
}

/** Shape of the backend's `PublicUser` (Prisma `User` minus `password`), as returned by `/users/me`. */
export interface AccountUser {
    id: string;
    email: string;
    username: string;
    name: string | null;
    phone: string | null;
    avatarUrl: string | null;
    role: UserRole;
    status: AccountStatus;
    emailVerifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AccountSession {
    id: string;
    deviceType: string | null;
    deviceName: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: string;
    lastUsedAt: string;
    expiresAt: string;
    revokedAt: string | null;
}
