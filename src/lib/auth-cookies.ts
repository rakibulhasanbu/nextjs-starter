"server-only";

import { cookies } from "next/headers";

import { User } from "@/features/auth/types";

export const AUTH_COOKIE_NAMES = {
    accessToken: "accessToken",
    refreshToken: "refreshToken",
    user: "user",
} as const;

const AUTH_COOKIE_MAX_AGE = {
    accessToken: 60 * 60 * 24, // 1 day — short-lived, refreshed via refreshToken
    refreshToken: 60 * 60 * 25 * 15, // 15 days
    user: 60 * 60 * 24 * 15, // 15 days
} as const;

const cookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
});

interface AuthCookiePayload {
    accessToken?: string;
    refreshToken?: string;
    user?: User;
}

export const setAuthCookies = async ({ accessToken, refreshToken, user }: AuthCookiePayload) => {
    const cookieStore = await cookies();

    if (accessToken) {
        cookieStore.set(AUTH_COOKIE_NAMES.accessToken, accessToken, cookieOptions(AUTH_COOKIE_MAX_AGE.accessToken));
    }

    if (refreshToken) {
        cookieStore.set(AUTH_COOKIE_NAMES.refreshToken, refreshToken, cookieOptions(AUTH_COOKIE_MAX_AGE.refreshToken));
    }

    if (user) {
        cookieStore.set(AUTH_COOKIE_NAMES.user, JSON.stringify(user), cookieOptions(AUTH_COOKIE_MAX_AGE.user));
    }
};

export const clearAuthCookies = async () => {
    const cookieStore = await cookies();
    cookieStore.delete({ name: AUTH_COOKIE_NAMES.accessToken, path: "/" });
    cookieStore.delete({ name: AUTH_COOKIE_NAMES.refreshToken, path: "/" });
    cookieStore.delete({ name: AUTH_COOKIE_NAMES.user, path: "/" });
};

export const getAccessTokenCookie = async () => {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;
};

export const getRefreshTokenCookie = async () => {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value;
};

export const getUserCookie = async (): Promise<User | undefined> => {
    const cookieStore = await cookies();
    const raw = cookieStore.get(AUTH_COOKIE_NAMES.user)?.value;
    return raw ? (JSON.parse(raw) as User) : undefined;
};
