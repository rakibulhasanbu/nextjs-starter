import { LucideIcon } from "lucide-react";

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload extends LoginPayload {
    confirm_password: string;
}

export enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
    SELLER = "SELLER",
    EMPLOYEE = "EMPLOYEE",
}

export interface User {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
    isBlocked: boolean;
    name: string;
    createdAt: string;
    photoUrl: string;
    role: UserRole;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

export interface AuthPayload {
    name: string;
    email: string;
    password: string;
    action: "login" | "register";
    callbackUrl: string;
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
