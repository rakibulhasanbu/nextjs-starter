import { LucideIcon } from "lucide-react";

export enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
}

export enum UserStatus {
    PENDING_VERIFICATION = "PENDING_VERIFICATION",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
}

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
}

/** Shape of the backend's `PublicUser` (Prisma `User` minus `password`). */
export interface User {
    id: string;
    email: string;
    username: string;
    name: string | null;
    phone: string | null;
    avatarUrl: string | null;
    dateOfBirth: string | null;
    gender: Gender | null;
    role: UserRole;
    status: UserStatus;
    emailVerifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

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
