"server-only";

import { cookies } from "next/headers";

import { config } from "@/config";
import { User } from "@/features/auth/types";

export const AUTH_COOKIE_NAMES = {
    accessToken: "accessToken",
    refreshToken: "refreshToken",
    user: "user",
} as const;

/**
 * All three cookies share the refresh token's window. The access token inside
 * is still short-lived (the backend's `JWT_ACCESS_TTL`, 15m by default) and the
 * api client refreshes it on a 401 — but the *cookie* has to outlive it, because
 * `proxy.ts` gates on cookie presence and expiring it early signs the user out
 * while their refresh token is still good.
 */
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * config.refreshTokenTtlDays;

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
        cookieStore.set(AUTH_COOKIE_NAMES.accessToken, accessToken, cookieOptions(AUTH_COOKIE_MAX_AGE));
    }

    if (refreshToken) {
        cookieStore.set(AUTH_COOKIE_NAMES.refreshToken, refreshToken, cookieOptions(AUTH_COOKIE_MAX_AGE));
    }

    if (user) {
        cookieStore.set(AUTH_COOKIE_NAMES.user, JSON.stringify(user), cookieOptions(AUTH_COOKIE_MAX_AGE));
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
