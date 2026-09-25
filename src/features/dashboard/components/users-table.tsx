"use client";

import { useMemo, useState } from "react";

import {
    DataTable,
    DataTableFacetedFilter,
    DataTableHeader,
    DataTableProvider,
    DataTableSearch,
    useDataTableUrlState,
} from "@/components/table";
import { useAlert } from "@/hooks/use-alert";
import { toast } from "@/components/ui/toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError, QueryParams } from "@/lib/api-client";
import { hasPermission, PERMISSIONS } from "@/features/auth/types";
import { useMe } from "@/features/account/api";
import { useRoles } from "@/features/roles/api";
import { useAuthStore } from "@/store/auth-store";
import {
    useAdminUsers,
    useRestoreAdminUserMutation,
    useTriggerPasswordResetMutation,
    useUpdateUserStatusMutation,
} from "@/features/dashboard/api";
import { buildUsersColumns, canActorManage } from "@/features/dashboard/components/users-columns";
import { UserEditDialog } from "@/features/dashboard/components/user-edit-dialog";
import { UserSessionsDialog } from "@/features/dashboard/components/user-sessions-dialog";
import { InviteUserDialog } from "@/features/dashboard/components/invite-user-dialog";
import { AdminUser, UserStatus } from "@/features/dashboard/types";

const statusOptions = [
    { value: UserStatus.ACTIVE, label: "Active" },
    { value: UserStatus.PENDING_VERIFICATION, label: "Pending verification" },
    { value: UserStatus.SUSPENDED, label: "Suspended" },
];

const UsersTableInner = () => {
    const { pagination, setPagination, searchTerm, columnFilters } = useDataTableUrlState({ defaultPageSize: 20 });
    const alert = useAlert();
    const actorId = useAuthStore((state) => state.user?.id);
    const { data: me } = useMe();
    const { data: roles } = useRoles();

    // Gate on the permissions the backend actually checks, not on a role name.
    const canInvite = hasPermission(me?.permissions, PERMISSIONS.USER_INVITE);
    const canAssignRoles = hasPermission(me?.permissions, PERMISSIONS.ROLE_ASSIGN);

    const roleOptions = useMemo(
        () => (roles ?? []).map((role) => ({ value: role.id, label: role.name })),
        [roles]
    );

    const [view, setView] = useState<"active" | "deleted">("active");
    const [editing, setEditing] = useState<AdminUser | null>(null);
    const [viewingSessions, setViewingSessions] = useState<AdminUser | null>(null);

    const handleViewChange = (next: string) => {
        setView(next as "active" | "deleted");
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    const params = useMemo<QueryParams>(() => {
        const roleId = columnFilters.find((f) => f.id === "roleIds")?.value;
        const status = columnFilters.find((f) => f.id === "status")?.value;
        return {
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            search: searchTerm || undefined,
            // The backend's list query is a strictObject keyed on `roleId` — `role` would 400.
            roleId: Array.isArray(roleId) ? roleId[0] : roleId,
            status: view === "deleted" ? undefined : Array.isArray(status) ? status[0] : status,
            deleted: view === "deleted" ? "true" : undefined,
        };
    }, [pagination, searchTerm, columnFilters, view]);

    const { data, isLoading } = useAdminUsers(params);

    const updateStatus = useUpdateUserStatusMutation();
    const triggerReset = useTriggerPasswordResetMutation();
    const restore = useRestoreAdminUserMutation();

    const handleToggleStatus = (user: AdminUser) => {
        const nextStatus = user.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
        alert.fire({
            title: nextStatus === UserStatus.SUSPENDED ? "Suspend this user?" : "Reactivate this user?",
            text:
                nextStatus === UserStatus.SUSPENDED
                    ? "They'll be signed out everywhere and unable to log back in."
                    : undefined,
            confirmButtonOptions: {
                variant: nextStatus === UserStatus.SUSPENDED ? "destructive" : "default",
                text: nextStatus === UserStatus.SUSPENDED ? "Suspend" : "Reactivate",
            },
            showCancelButton: true,
            onConfirm: async () => {
                try {
                    await updateStatus.mutateAsync({ id: user.id, status: nextStatus });
                    toast.add({ title: nextStatus === UserStatus.SUSPENDED ? "User suspended" : "User reactivated" });
                } catch (error) {
                    toast.add({
                        title: "Update failed",
                        description: error instanceof ApiError ? error.message : "Something went wrong",
                        type: "error",
                    });
                }
            },
        });
    };

    const handleResetPassword = (user: AdminUser) => {
        alert.fire({
            title: "Send password reset email?",
            text: `A reset link will be emailed to ${user.email}.`,
            confirmButtonOptions: { text: "Send" },
            showCancelButton: true,
            onConfirm: async () => {
                await triggerReset.mutateAsync(user.id);
                toast.add({ title: "Password reset email sent" });
            },
        });
    };

    const handleRestore = async (user: AdminUser) => {
        await restore.mutateAsync(user.id);
        toast.add({ title: "User restored" });
    };

    const columns = useMemo(
        () =>
            buildUsersColumns({
                view,
                canManage: (user) => canActorManage(actorId, user),
                onEdit: setEditing,
                onToggleStatus: handleToggleStatus,
                onViewSessions: setViewingSessions,
                onResetPassword: handleResetPassword,
                onRestore: handleRestore,
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [actorId, view]
    );

    return (
        <DataTableProvider data={data?.data} columns={columns} rowCount={data?.meta?.total} getRowId={(row) => row.id}>
            <Tabs value={view} onValueChange={handleViewChange}>
                <TabsList>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="deleted">Deleted</TabsTrigger>
                </TabsList>
            </Tabs>
            <DataTableHeader
                filters={
                    <>
                        <DataTableSearch placeholder="Search by name, email, username..." />
                        <DataTableFacetedFilter columnId="roleIds" title="Role" options={roleOptions} />
                        {view === "active" && (
                            <DataTableFacetedFilter columnId="status" title="Status" options={statusOptions} />
                        )}
                    </>
                }
                actions={canInvite ? <InviteUserDialog /> : undefined}
            />
            <DataTable<AdminUser>
                isLoading={isLoading}
                emptyTitle="No users found"
                emptyDescription="Try adjusting your search or filters."
                onRowClick={(user) => (canActorManage(actorId, user) ? setEditing(user) : undefined)}
            />
            <UserEditDialog
                user={editing}
                canEditRoles={canAssignRoles}
                onOpenChange={(open) => !open && setEditing(null)}
            />
            <UserSessionsDialog user={viewingSessions} onOpenChange={(open) => !open && setViewingSessions(null)} />
        </DataTableProvider>
    );
};

export const UsersTable = () => <UsersTableInner />;
