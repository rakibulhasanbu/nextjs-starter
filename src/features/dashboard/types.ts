import { UserRole } from "@/features/auth/types";

export enum UserStatus {
    PENDING_VERIFICATION = "PENDING_VERIFICATION",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
}

export interface AdminUser {
    id: string;
    email: string;
    username: string;
    name: string | null;
    phone: string | null;
    avatarUrl: string | null;
    role: UserRole;
    status: UserStatus;
    emailVerifiedAt: string | null;
    failedLoginAttempts: number;
    lockedUntil: string | null;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AdminUserSession {
    id: string;
    userId: string;
    deviceType: string | null;
    deviceName: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: string;
    lastUsedAt: string;
    expiresAt: string;
    revokedAt: string | null;
}
