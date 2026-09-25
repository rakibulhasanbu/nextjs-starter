"use server";

import { config } from "@/config";
import { AuthResponse, SignInResult, User } from "@/features/auth/types";

import type { ApiErrorResponse, ApiSuccessResponse } from "@/lib/api-types";
import { clearAuthCookies, getRefreshTokenCookie, setAuthCookies } from "@/lib/auth-cookies";
import { fetchMe } from "@/lib/current-user";

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
    twoFactorLoginVerify: "/auth/2fa/login-verify",
    reactivateAccount: "/auth/reactivate-account",
} as const;

type AuthActionResult<T> =
    { status: "success"; data: T } | { status: "error"; error: string; code?: string; graceEndsAt?: string };

/** Raw POST against the backend — every server action below is this call with a different endpoint/body/headers. */
const backendRequest = async <T>(
    endpoint: string,
    body: unknown,
    extraHeaders?: Record<string, string>
): Promise<{ ok: true; data: T } | { ok: false; error: string; code?: string; graceEndsAt?: string }> => {
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
            const { message, code, graceEndsAt } = (json as ApiErrorResponse) ?? {};
            return {
                ok: false,
                error: message || "Something went wrong",
                code,
                // Only `ACCOUNT_PENDING_DELETION` carries this; it is the
                // deadline after which the account cannot be restored.
                graceEndsAt: typeof graceEndsAt === "string" ? graceEndsAt : undefined,
            };
        }

        const data = json === null ? null : (json as ApiSuccessResponse<T>).data;
        return { ok: true, data: data as T };
    } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Something went wrong" };
    }
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
    const result = await backendRequest<SignInResult>(AUTH_ENDPOINTS.login, { email, password });
    if (!result.ok)
        return {
            status: "error",
            error: result.error,
            code: result.code,
            graceEndsAt: result.graceEndsAt,
        } as const;

    // 2FA-enabled accounts get a short-lived token to complete the challenge instead of tokens directly.
    if ("twoFactorRequired" in result.data && result.data.twoFactorRequired) {
        return { status: "twoFactorRequired", twoFactorToken: result.data.twoFactorToken } as const;
    }

    return establishSession(result.data as AuthResponse);
};

interface Login2faVerifyActionProps {
    twoFactorToken: string;
    code?: string;
    recoveryCode?: string;
    deviceType?: string;
    deviceName?: string;
}

/** Consumes the intermediate 2FA token plus a TOTP code or recovery code, then signs the user in. */
export const login2faVerifyAction = async ({
    twoFactorToken,
    code,
    recoveryCode,
    deviceType,
    deviceName,
}: Login2faVerifyActionProps) => {
    const result = await backendRequest<AuthResponse>(AUTH_ENDPOINTS.twoFactorLoginVerify, {
        twoFactorToken,
        code,
        recoveryCode,
        deviceType,
        deviceName,
    });
    if (!result.ok)
        return {
            status: "error",
            error: result.error,
            code: result.code,
            graceEndsAt: result.graceEndsAt,
        } as const;
    return establishSession(result.data);
};

interface RegisterActionProps {
    name: string;
    email: string;
    phone?: string;
    password: string;
}

/** Registration does not log the user in — the account stays PENDING_VERIFICATION until they click the emailed link. */
export const registerAction = async ({ name, email, phone, password }: RegisterActionProps) => {
    const result = await backendRequest<{ user: User }>(AUTH_ENDPOINTS.register, {
        name,
        email,
        phone: phone || undefined,
        password,
    });
    if (!result.ok)
        return {
            status: "error",
            error: result.error,
            code: result.code,
            graceEndsAt: result.graceEndsAt,
        } as const;
    return { status: "success", data: result.data } as const;
};

/**
 * Undoes a self-deletion while the account is still inside its grace period.
 * The code is not requested from here — the backend mails it automatically when
 * sign-in, sign-up or Google login hits a deleted account and answers 409
 * `ACCOUNT_PENDING_DELETION`, which is what routes the user to this screen.
 */
export const reactivateAccountAction = async (email: string, code: string) => {
    const result = await backendRequest<null>(AUTH_ENDPOINTS.reactivateAccount, { email, code });
    if (!result.ok) return { status: "error", error: result.error } as const;
    return { status: "success", data: null } as const;
};

/** Consumes the 6-digit code emailed to the user, then signs them in — proving the code is proof of ownership. */
export const verifyEmailAction = async (email: string, code: string) => {
    const result = await backendRequest<AuthResponse>(AUTH_ENDPOINTS.verifyEmail, { email, code });
    if (!result.ok) return { status: "error", error: result.error } as const;
    return establishSession(result.data);
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

/** Consumes the 6-digit code emailed to the user, then signs them in — proving the code is proof of ownership. */
export const resetPasswordAction = async ({
    email,
    code,
    password,
}: {
    email: string;
    code: string;
    password: string;
}) => {
    const result = await backendRequest<AuthResponse>(AUTH_ENDPOINTS.resetPassword, { email, code, password });
    if (!result.ok) return { status: "error", error: result.error } as const;
    return establishSession(result.data);
};

export const loginWithGoogleAction = async (idToken: string) => {
    const result = await backendRequest<AuthResponse>(AUTH_ENDPOINTS.google, { idToken });
    if (!result.ok)
        return {
            status: "error",
            error: result.error,
            code: result.code,
            graceEndsAt: result.graceEndsAt,
        } as const;
    return establishSession(result.data);
};

/**
 * The passkey exchange happens in the browser (the WebAuthn call needs `window`),
 * so the resulting tokens arrive client-side. This puts them into the httpOnly
 * cookies `proxy.ts` reads, which only a server action can write.
 */
export const establishPasskeySessionAction = async (tokens: AuthResponse) => establishSession(tokens);

export const logoutAction = async () => {
    const refreshToken = await getRefreshTokenCookie();
    if (refreshToken) {
        await backendRequest(AUTH_ENDPOINTS.logout, { refreshToken });
    }
    await clearAuthCookies();
};

/**
 * Called after the api client rotates tokens. The `user` cookie is refreshed
 * along with them: it carries the roles and permissions both `proxy.ts` and the
 * dashboard layout gate on, and leaving it untouched meant a revoked role or a
 * suspension did not reach the client gate until the next sign-in.
 *
 * A failed `/users/me` leaves the old snapshot in place rather than signing the
 * user out — the tokens themselves are fresh, and the api client will surface
 * any real authorization change on its next call.
 */
export const revalidateTokensAction = async (accessToken: string, refreshToken: string) => {
    const user = await fetchMe(accessToken);
    await setAuthCookies({ accessToken, refreshToken, user: user ?? undefined });
    return user;
};
