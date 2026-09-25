import { Gender, PermissionKey, UserProfile } from "@/features/auth/types";

export enum AccountStatus {
    PENDING_VERIFICATION = "PENDING_VERIFICATION",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
}

/** Shape of the backend's `PublicUser`, as returned by `/users/me`. */
export interface AccountUser {
    id: string;
    email: string;
    username: string;
    name: string | null;
    phone: string | null;
    avatarUrl: string | null;
    roleIds: string[];
    profile: UserProfile | null;
    status: AccountStatus;
    emailVerifiedAt: string | null;
    twoFactorEnabled: boolean;
    /** False for Google- or passkey-only accounts: offer set-password, not change-password. */
    hasPassword: boolean;
    createdAt: string;
    updatedAt: string;
    permissions: PermissionKey[];
    maxRank: number;
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
    /**
     * True for the session this request came from, so the list can name the
     * device in the user's hand. Always false on tokens issued before the
     * backend started stamping a session id — never a reason to hide the row.
     */
    isCurrent: boolean;
}

/**
 * Request body for `PATCH /users/me`. The backend validates it with a
 * `z.strictObject`, so an unknown top-level key is a 400 — in particular
 * `dateOfBirth` and `gender` must go inside `profile`, not beside it.
 */
export interface UpdateMePayload {
    name?: string;
    username?: string;
    phone?: string;
    avatarUrl?: string;
    profile?: {
        dateOfBirth?: string;
        gender?: Gender;
        bio?: string;
    };
}

/** Shape of `GET/PATCH /users/me/notifications`. Missing row on the backend still resolves to all-true defaults. */
export interface NotificationPreferences {
    loginEmailNotification: boolean;
    transactionsEmailNotification: boolean;
    transactionsPushNotification: boolean;
}

/** Partial update — omitted channels keep their current value. */
export type UpdateNotificationPreferencesPayload = Partial<NotificationPreferences>;
