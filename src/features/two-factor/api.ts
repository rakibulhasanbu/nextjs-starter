import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { Enable2faResponse, Setup2faResponse } from "@/features/two-factor/types";

export const twoFactorKeys = {
    setup: ["two-factor", "setup"] as const,
};

// Step 1 of enabling 2FA: generates a fresh secret and returns a QR code to scan.
export const useSetup2faMutation = () =>
    useMutation({
        mutationFn: () => apiFetch<Setup2faResponse>("/auth/2fa/setup", { method: "POST" }),
    });

// Step 2: confirming the TOTP code turns 2FA on and returns one-time recovery codes.
export const useEnable2faMutation = () =>
    useMutation({
        mutationFn: (data: { code: string }) =>
            apiFetch<Enable2faResponse>("/auth/2fa/enable", { method: "POST", body: data }),
    });

export const useDisable2faMutation = () =>
    useMutation({
        mutationFn: (data: { password: string; code: string }) =>
            apiFetch<void>("/auth/2fa/disable", { method: "POST", body: data }),
    });
