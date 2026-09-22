"use server";

import { config } from "@/config";
import { AuthResponse, User } from "@/features/auth/types";

import type { ApiErrorResponse, ApiSuccessResponse } from "@/lib/api-types";
import { clearAuthCookies, getRefreshTokenCookie, setAuthCookies } from "@/lib/auth-cookies";

const AUTH_ENDPOINTS = {
    register: "/auth/signup",
    login: "/auth/signin",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    google: "/auth/google",
    me: "/users/me",
} as const;

type AuthActionResult<T> = { status: "success"; data: T } | { status: "error"; error: string };

/** Raw POST against the backend — every server action below is this call with a different endpoint/body/headers. */
const backendRequest = async <T>(
    endpoint: string,
    body: unknown,
    extraHeaders?: Record<string, string>
): Promise<{ ok: true; data: T } | { ok: false; error: string }> => {
    try {
        const response = await fetch(`${config.serverUrl}${endpoint}`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                ...extraHeaders,
            },
        });

        // 204 No Content endpoints have no JSON body to parse.
        const json = response.status === 204 ? null : await response.json().catch(() => null);

        if (!response.ok) {
            const { message } = (json as ApiErrorResponse) ?? {};
            return { ok: false, error: message || "Something went wrong" };
        }

        const data = json === null ? null : (json as ApiSuccessResponse<T>).data;
        return { ok: true, data: data as T };
    } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Something went wrong" };
    }
};

const fetchMe = async (accessToken: string): Promise<User | null> => {
    const response = await fetch(`${config.serverUrl}${AUTH_ENDPOINTS.me}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return null;
    const json = (await response.json()) as ApiSuccessResponse<User>;
    return json.data;
};

/** Login/register-with-Google both return tokens only (no user) — fetch `/users/me` and persist the session. */
const establishSession = async (tokens: AuthResponse): Promise<AuthActionResult<{ user: User } & AuthResponse>> => {
    const user = await fetchMe(tokens.accessToken);
    if (!user) {
        return { status: "error", error: "Signed in, but couldn't load your profile. Try again." };
    }
    await setAuthCookies({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user });
    return { status: "success", data: { ...tokens, user } };
};

export const loginAction = async (email: string, password: string) => {
    const result = await backendRequest<AuthResponse>(AUTH_ENDPOINTS.login, { email, password });
    if (!result.ok) return { status: "error", error: result.error } as const;
    return establishSession(result.data);
};

interface RegisterActionProps {
    name: string;
    email: string;
    phone: string;
    password: string;
}

/**
 * Registration does not log the user in — the account stays PENDING_VERIFICATION until they click the emailed link.
 * The backend's signup DTO (`z.strictObject`) only accepts `email`/`password`/`name` — it 400s on unrecognized
 * keys, so `phone` isn't forwarded here. Persist it later via the account profile update once the user is signed in.
 */
export const registerAction = async ({ name, email, password }: RegisterActionProps) => {
    const result = await backendRequest<{ user: User }>(AUTH_ENDPOINTS.register, { name, email, password });
    if (!result.ok) return { status: "error", error: result.error } as const;
    return { status: "success", data: result.data } as const;
};

/** Consumes the token from the emailed verification link. Public endpoint — no auth required. */
export const verifyEmailAction = async (token: string) => {
    const result = await backendRequest<null>(AUTH_ENDPOINTS.verifyEmail, { token });
    if (!result.ok) return { status: "error", error: result.error } as const;
    return { status: "success", data: null } as const;
};

export const resendVerificationAction = async (email: string) => {
    const result = await backendRequest<null>(AUTH_ENDPOINTS.resendVerification, { email });
    if (!result.ok) return { status: "error", error: result.error } as const;
    return { status: "success", data: null } as const;
};

export const forgotPasswordAction = async (email: string) => {
    const result = await backendRequest<null>(AUTH_ENDPOINTS.forgotPassword, { email });
    if (!result.ok) return { status: "error", error: result.error } as const;
    return { status: "success", data: null } as const;
};

/** Consumes the token from the emailed reset-password link. Public endpoint — no auth required. */
export const resetPasswordAction = async ({ token, password }: { token: string; password: string }) => {
    const result = await backendRequest<null>(AUTH_ENDPOINTS.resetPassword, { token, password });
    if (!result.ok) return { status: "error", error: result.error } as const;
    return { status: "success", data: null } as const;
};

export const loginWithGoogleAction = async (idToken: string) => {
    const result = await backendRequest<AuthResponse>(AUTH_ENDPOINTS.google, { idToken });
    if (!result.ok) return { status: "error", error: result.error } as const;
    return establishSession(result.data);
};

export const logoutAction = async () => {
    const refreshToken = await getRefreshTokenCookie();
    if (refreshToken) {
        await backendRequest(AUTH_ENDPOINTS.logout, { refreshToken });
    }
    await clearAuthCookies();
};

export const revalidateTokensAction = async (accessToken: string, refreshToken: string) => {
    await setAuthCookies({ accessToken, refreshToken });
};
