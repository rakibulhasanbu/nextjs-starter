import { UserProfile } from "@/features/auth/types";

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
    roleIds: string[];
    profile: UserProfile | null;
    status: UserStatus;
    emailVerifiedAt: string | null;
    /** False for Google- or passkey-only accounts: offer set-password, not change-password. */
    hasPassword: boolean;
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

/** Request body for `PATCH /admin/users/:id` — roles are excluded by design, they have their own endpoint. */
export interface AdminUpdateUserPayload {
    email?: string;
    name?: string;
    username?: string;
    phone?: string;
    avatarUrl?: string;
}
