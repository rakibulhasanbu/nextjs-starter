import { config } from "@/config";
import { useAuthStore } from "@/features/auth/store";

import { toast } from "@/components/ui/toast";

export const API_TIMEOUT = 120_000; // 2 minutes
export const API_BASE_URL = config.serverUrl;

export const METHOD = {
    POST: "POST",
    GET: "GET",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE",
} as const;

export type Method = (typeof METHOD)[keyof typeof METHOD];

export interface IMeta {
    limit: number;
    page: number;
    total: number;
}

export type PaginatedResponse<T> = {
    data: T[];
    meta?: IMeta;
    success: boolean;
    message: string;
    statusCode: number;
};

export type ResponseObject<T> = {
    data: T;
    message: string;
    success: boolean;
    statusCode: number;
};

export type ErrorResponse = {
    path: string | number;
    message: string;
};

export type QueryParams = {
    [key: string]: string | string[] | number | undefined;
};

export class ApiError extends Error {
    status: number;
    body: unknown;

    constructor(status: number, message: string, body?: unknown) {
        super(message);
        this.status = status;
        this.body = body;
    }
}

type RequestOptions = {
    method?: Method;
    body?: unknown;
    params?: QueryParams;
    headers?: Record<string, string>;
    /** Internal: skips auth header + 401 refresh handling (used for the refresh call itself). */
    skipAuth?: boolean;
};

const buildUrl = (endpoint: string, params?: QueryParams) => {
    const url = new URL(endpoint, API_BASE_URL);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined) return;
            if (Array.isArray(value)) {
                value.forEach((v) => url.searchParams.append(key, v));
            } else {
                url.searchParams.set(key, String(value));
            }
        });
    }

    return url.toString();
};

const rawFetch = async (endpoint: string, options: RequestOptions = {}) => {
    const { method = METHOD.GET, body, params, headers, skipAuth } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const authHeaders: Record<string, string> = {};
    if (!skipAuth) {
        const token = useAuthStore.getState().accessToken;
        if (token) authHeaders.Authorization = token;
    }

    try {
        const response = await fetch(buildUrl(endpoint, params), {
            method,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            headers: {
                "Content-Type": "application/json",
                ...authHeaders,
                ...headers,
            },
            signal: controller.signal,
        });

        const data = await response.json().catch(() => null);

        return { response, data };
    } finally {
        clearTimeout(timeoutId);
    }
};

// Ensures concurrent 401s trigger a single refresh call; all callers await the same promise.
let refreshPromise: Promise<boolean> | null = null;

const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const refreshToken = useAuthStore.getState().refreshToken;

            if (!refreshToken) {
                await useAuthStore.getState().logout();
                return false;
            }

            const { response, data } = await rawFetch("/auth/refresh-token", {
                method: METHOD.POST,
                body: { refreshToken },
                skipAuth: true,
            });

            if (response.ok && data) {
                const result = data as ResponseObject<{ accessToken: string }>;
                await useAuthStore.getState().setTokensAndRevalidate({
                    accessToken: result.data.accessToken,
                    refreshToken,
                });
                return true;
            }

            await useAuthStore.getState().logoutWithReload();
            toast.add({ title: "Session expired" });
            return false;
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

export const apiFetch = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    let { response, data } = await rawFetch(endpoint, options);

    if (response.status === 401 && !options.skipAuth) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            ({ response, data } = await rawFetch(endpoint, options));
        }
    }

    if (!response.ok) {
        throw new ApiError(response.status, data?.message || "Something went wrong", data);
    }

    return data as T;
};
