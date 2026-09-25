import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch, apiFetchPaginated, QueryParams } from "@/lib/api-client";
import { AdminUpdateUserPayload, AdminUser, AdminUserSession, UserStatus } from "@/features/dashboard/types";

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
        mutationFn: (data: AdminUpdateUserPayload) =>
            apiFetch<AdminUser>(`/admin/users/${id}`, { method: "PATCH", body: data }),
        onSuccess: () => invalidate(id),
    });
};

/**
 * Roles are deliberately not editable through `PATCH /admin/users/:id` — they
 * sit behind their own `role:assign` permission and their own endpoint, which
 * replaces the whole set (the backend always re-adds the baseline `user` role).
 */
export const useAssignUserRolesMutation = (id: string) => {
    const invalidate = useInvalidateAdminUsers();
    return useMutation({
        mutationFn: (roleIds: string[]) =>
            apiFetch<AdminUser>(`/admin/users/${id}/roles`, { method: "PATCH", body: { roleIds } }),
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

/**
 * Creates the account and emails a password-reset code — completing that reset
 * is what both sets a real password and proves the invitee owns the address.
 * The backend always re-adds the baseline `user` role, so `roleIds` only needs
 * to carry the elevated role, if any.
 */
export const useInviteUserMutation = () => {
    const invalidate = useInvalidateAdminUsers();
    return useMutation({
        mutationFn: ({ email, roleIds }: { email: string; roleIds: string[] }) =>
            apiFetch<AdminUser>("/admin/users/invite", { method: "POST", body: { email, roleIds } }),
        onSuccess: () => invalidate(),
    });
};
