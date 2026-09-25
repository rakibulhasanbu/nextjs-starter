import { METHOD } from "@/lib/api-client";

export type Method = (typeof METHOD)[keyof typeof METHOD];

export type QueryParams = {
    [key: string]: string | string[] | number | undefined;
};

export interface IMeta {
    page: number;
    limit: number;
    total: number;
}

/** Envelope every backend success response is wrapped in (`TransformResponseInterceptor`). */
export type ApiSuccessResponse<T> = {
    data: T;
    meta?: IMeta;
};

/** Envelope every backend error response is wrapped in (`AllExceptionsFilter`). */
export type ApiErrorResponse = {
    statusCode: number;
    code: string;
    message: string;
    /** Per-field validation failures. Only `VALIDATION_ERROR` sets this. */
    details?: unknown[];
    /**
     * Extra machine-readable context a specific error code carries — e.g.
     * `ACCOUNT_PENDING_DELETION` carries `graceEndsAt` as an ISO string. Read it
     * only after narrowing on `code`.
     */
    [key: string]: unknown;
};
