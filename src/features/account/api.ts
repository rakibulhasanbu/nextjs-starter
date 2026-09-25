import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import {
    AccountSession,
    AccountUser,
    NotificationPreferences,
    UpdateMePayload,
    UpdateNotificationPreferencesPayload,
} from "@/features/account/types";

export const accountKeys = {
    me: ["account", "me"] as const,
    sessions: ["account", "sessions"] as const,
    notifications: ["account", "notifications"] as const,
};

export const useMe = () =>
    useQuery({
        queryKey: accountKeys.me,
        queryFn: () => apiFetch<AccountUser>("/users/me"),
    });

export const useUpdateMeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateMePayload) =>
            apiFetch<AccountUser>("/users/me", { method: "PATCH", body: data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.me }),
    });
};

export const useChangePasswordMutation = () =>
    useMutation({
        mutationFn: (data: { currentPassword: string; newPassword: string }) =>
            apiFetch<void>("/auth/change-password", { method: "POST", body: data }),
    });

/**
 * For accounts with no password yet (Google- or passkey-only). Unlike
 * change-password, this does not revoke existing sessions — it adds a login
 * method rather than rotating a credential that might be compromised.
 */
export const useSetPasswordMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newPassword: string) =>
            apiFetch<void>("/auth/set-password", { method: "POST", body: { newPassword } }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.me }),
    });
};

export const useMySessions = () =>
    useQuery({
        queryKey: accountKeys.sessions,
        queryFn: () => apiFetch<AccountSession[]>("/auth/sessions"),
    });

export const useRevokeSessionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sessionId: string) => apiFetch<void>(`/auth/sessions/${sessionId}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.sessions }),
    });
};

export const useRevokeAllSessionsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => apiFetch<void>("/auth/sessions", { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.sessions }),
    });
};

// Step 1 of account deletion: emails a 6-digit confirmation code.
export const useRequestAccountDeletionMutation = () =>
    useMutation({
        mutationFn: () => apiFetch<void>("/auth/request-account-deletion", { method: "POST" }),
    });

// Step 2: consuming the code soft-deletes the account and revokes every session server-side.
export const useConfirmAccountDeletionMutation = () =>
    useMutation({
        mutationFn: (code: string) => apiFetch<void>("/auth/delete-account", { method: "POST", body: { code } }),
    });

export const useNotificationPreferences = () =>
    useQuery({
        queryKey: accountKeys.notifications,
        queryFn: () => apiFetch<NotificationPreferences>("/users/me/notifications"),
    });

export const useUpdateNotificationPreferencesMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateNotificationPreferencesPayload) =>
            apiFetch<NotificationPreferences>("/users/me/notifications", { method: "PATCH", body: data }),
        onSuccess: (data) => queryClient.setQueryData(accountKeys.notifications, data),
    });
};
