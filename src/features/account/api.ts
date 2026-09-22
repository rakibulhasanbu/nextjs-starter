import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { UpdateProfileFormValues } from "@/features/account/schemas";
import { AccountSession, AccountUser } from "@/features/account/types";

export const accountKeys = {
    me: ["account", "me"] as const,
    sessions: ["account", "sessions"] as const,
};

export const useMe = () =>
    useQuery({
        queryKey: accountKeys.me,
        queryFn: () => apiFetch<AccountUser>("/users/me"),
    });

export const useUpdateMeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<UpdateProfileFormValues>) =>
            apiFetch<AccountUser>("/users/me", { method: "PATCH", body: data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.me }),
    });
};

export const useChangePasswordMutation = () =>
    useMutation({
        mutationFn: (data: { currentPassword: string; newPassword: string }) =>
            apiFetch<void>("/auth/change-password", { method: "POST", body: data }),
    });

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
