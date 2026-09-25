import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { CreateRolePayload, PermissionDefinition, Role, UpdateRolePayload } from "@/features/roles/types";

export const rolesKeys = {
    all: ["roles"] as const,
    list: () => [...rolesKeys.all, "list"] as const,
    permissions: () => ["permissions"] as const,
};

export const useRoles = () =>
    useQuery({
        queryKey: rolesKeys.list(),
        queryFn: () => apiFetch<Role[]>("/admin/roles"),
    });

/** The catalog is static per deploy, so it never needs refetching within a session. */
export const usePermissionCatalog = () =>
    useQuery({
        queryKey: rolesKeys.permissions(),
        queryFn: () => apiFetch<PermissionDefinition[]>("/admin/permissions"),
        staleTime: Infinity,
    });

const useInvalidateRoles = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: rolesKeys.all });
};

export const useCreateRoleMutation = () => {
    const invalidate = useInvalidateRoles();
    return useMutation({
        mutationFn: (data: CreateRolePayload) => apiFetch<Role>("/admin/roles", { method: "POST", body: data }),
        onSuccess: invalidate,
    });
};

export const useUpdateRoleMutation = (id: string) => {
    const invalidate = useInvalidateRoles();
    return useMutation({
        mutationFn: (data: UpdateRolePayload) =>
            apiFetch<Role>(`/admin/roles/${id}`, { method: "PATCH", body: data }),
        onSuccess: invalidate,
    });
};

export const useDeleteRoleMutation = () => {
    const invalidate = useInvalidateRoles();
    return useMutation({
        mutationFn: (id: string) => apiFetch<void>(`/admin/roles/${id}`, { method: "DELETE" }),
        onSuccess: invalidate,
    });
};
