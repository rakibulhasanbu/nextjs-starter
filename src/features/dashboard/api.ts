import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch, apiFetchPaginated, QueryParams } from "@/lib/api-client";
import { AdminUpdateUserFormValues } from "@/features/dashboard/schemas";
import { AdminUser, AdminUserSession, UserStatus } from "@/features/dashboard/types";

export const adminUsersKeys = {
    all: ["admin-users"] as const,
    list: (params: QueryParams) => [...adminUsersKeys.all, "list", params] as const,
    detail: (id: string) => [...adminUsersKeys.all, "detail", id] as const,
    sessions: (id: string) => [...adminUsersKeys.all, "detail", id, "sessions"] as const,
};

export const useAdminUsers = (params: QueryParams) =>
    useQuery({
        queryKey: adminUsersKeys.list(params),
        queryFn: () => apiFetchPaginated<AdminUser>("/admin/users", { params }),
    });

/** Cheap way to derive a count without an aggregate endpoint: read `.total` from a 1-row page. */
export const useAdminUsersCount = (params: QueryParams = {}) =>
    useAdminUsers({ ...params, page: 1, limit: 1 });

export const useAdminUser = (id: string) =>
    useQuery({
        queryKey: adminUsersKeys.detail(id),
        queryFn: () => apiFetch<AdminUser>(`/admin/users/${id}`),
        enabled: !!id,
    });

export const useAdminUserSessions = (id: string) =>
    useQuery({
        queryKey: adminUsersKeys.sessions(id),
        queryFn: () => apiFetch<AdminUserSession[]>(`/admin/users/${id}/sessions`),
        enabled: !!id,
    });

const useInvalidateAdminUsers = () => {
    const queryClient = useQueryClient();
    return (id?: string) => {
        queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
        if (id) queryClient.invalidateQueries({ queryKey: adminUsersKeys.detail(id) });
    };
};

export const useUpdateAdminUserMutation = (id: string) => {
    const invalidate = useInvalidateAdminUsers();
    return useMutation({
        mutationFn: (data: Partial<AdminUpdateUserFormValues>) =>
            apiFetch<AdminUser>(`/admin/users/${id}`, { method: "PATCH", body: data }),
        onSuccess: () => invalidate(id),
    });
};

export const useUpdateUserStatusMutation = () => {
    const invalidate = useInvalidateAdminUsers();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
            apiFetch<AdminUser>(`/admin/users/${id}/status`, { method: "PATCH", body: { status } }),
        onSuccess: (_data, vars) => invalidate(vars.id),
    });
};

export const useSoftDeleteAdminUserMutation = () => {
    const invalidate = useInvalidateAdminUsers();
    return useMutation({
        mutationFn: (id: string) => apiFetch<AdminUser>(`/admin/users/${id}`, { method: "DELETE" }),
        onSuccess: (_data, id) => invalidate(id),
    });
};

export const useRestoreAdminUserMutation = () => {
    const invalidate = useInvalidateAdminUsers();
    return useMutation({
        mutationFn: (id: string) => apiFetch<AdminUser>(`/admin/users/${id}/restore`, { method: "POST" }),
        onSuccess: (_data, id) => invalidate(id),
    });
};

export const useTriggerPasswordResetMutation = () =>
    useMutation({
        mutationFn: (id: string) => apiFetch<void>(`/admin/users/${id}/reset-password`, { method: "POST" }),
    });

export const useRevokeAdminUserSessionMutation = (userId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sessionId: string) =>
            apiFetch<void>(`/admin/users/${userId}/sessions/${sessionId}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUsersKeys.sessions(userId) }),
    });
};

export const useRevokeAllAdminUserSessionsMutation = (userId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => apiFetch<void>(`/admin/users/${userId}/sessions`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUsersKeys.sessions(userId) }),
    });
};

export const useInviteAdminMutation = () =>
    useMutation({
        mutationFn: (email: string) =>
            apiFetch<unknown>("/admin/users/invite-admin", { method: "POST", body: { email } }),
    });
