export const API_VERSION = "v1";

/**
 * Must mirror the backend's `JWT_REFRESH_TTL` (default `30d`). The cookies are
 * only carriers — the backend is what enforces expiry — but if this window is
 * shorter, users are signed out while their refresh token is still valid.
 */
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.NEXT_PUBLIC_REFRESH_TOKEN_TTL_DAYS ?? 30);

export const config = {
    serverUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/${API_VERSION}`,
    refreshTokenTtlDays: Number.isFinite(REFRESH_TOKEN_TTL_DAYS) ? REFRESH_TOKEN_TTL_DAYS : 30,
};
