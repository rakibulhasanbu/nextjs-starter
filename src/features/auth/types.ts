import { LucideIcon } from "lucide-react";

/**
 * Role ids are lowercase slugs, not an enum: roles are rows in the `roles`
 * table and new ones are created at runtime. Only the three seeded system
 * roles are known at compile time — see the backend's `SYSTEM_ROLE_IDS`.
 */
export const ROLE_IDS = {
    USER: "user",
    ADMIN: "admin",
    SUPER_ADMIN: "super_admin",
} as const;

export type RoleId = (typeof ROLE_IDS)[keyof typeof ROLE_IDS];

export const hasRole = (roleIds: string[] | undefined, roleId: string) => !!roleIds?.includes(roleId);

export const isSuperAdmin = (roleIds: string[] | undefined) => hasRole(roleIds, ROLE_IDS.SUPER_ADMIN);

/**
 * Mirrors the backend's permission catalog
 * (`src/common/authorization/permissions.constant.ts`), which is the source of
 * truth. Gate UI on these, never on a role name — roles are created at runtime
 * and their contents are editable.
 */
export const PERMISSIONS = {
    USER_READ_ANY: "user:read:any",
    USER_UPDATE_ANY: "user:update:any",
    USER_RESTORE_ANY: "user:restore:any",
    USER_STATUS_ANY: "user:status:any",
    USER_INVITE: "user:invite",
    USER_PASSWORD_RESET_ANY: "user:password-reset:any",
    SESSION_READ_ANY: "session:read:any",
    SESSION_REVOKE_ANY: "session:revoke:any",
    ROLE_READ: "role:read",
    ROLE_WRITE: "role:write",
    ROLE_ASSIGN: "role:assign",
    PERMISSION_READ: "permission:read",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const hasPermission = (permissions: string[] | undefined, permission: PermissionKey) =>
    !!permissions?.includes(permission);

export enum UserStatus {
    PENDING_VERIFICATION = "PENDING_VERIFICATION",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
}

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

/**
 * Optional personal details. The backend keeps these in a separate
 * `user_profiles` table and nests them under `profile` on the way out — and
 * expects the same nesting on `PATCH /users/me`.
 */
export interface UserProfile {
    /** Calendar date (YYYY-MM-DD) — stored as a DATE, never a timestamp. */
    dateOfBirth: string | null;
    gender: Gender | null;
    bio: string | null;
}

/** Shape of the backend's `PublicUser` (Prisma `User` minus secrets, plus roles and profile). */
export interface User {
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
    twoFactorEnabled: boolean;
    /** False for Google- or passkey-only accounts: offer set-password, not change-password. */
    hasPassword: boolean;
    createdAt: string;
    updatedAt: string;
    /** Only present on the caller's own record (`/users/me`) — it describes the requester. */
    permissions: PermissionKey[];
    /** Highest rank across the caller's roles; they may only manage subjects ranked below it. */
    maxRank: number;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

/** `/auth/signin` returns tokens directly, or a short-lived token to complete the 2FA challenge. */
export type SignInResult = AuthResponse | TwoFactorRequiredResponse;

export interface TwoFactorRequiredResponse {
    twoFactorRequired: true;
    twoFactorToken: string;
}

export const isTwoFactorRequired = (result: SignInResult): result is TwoFactorRequiredResponse =>
    "twoFactorRequired" in result && result.twoFactorRequired === true;

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
        title: string;
        url: string;
    }[];
    activeSubPaths?: string[];
    excludePaths?: string[];
}
