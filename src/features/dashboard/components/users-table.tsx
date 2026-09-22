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
import { UserRole } from "@/features/auth/types";
import { useAuthStore } from "@/store/auth-store";
import {
    useAdminUsers,
    useSoftDeleteAdminUserMutation,
    useRestoreAdminUserMutation,
    useTriggerPasswordResetMutation,
    useUpdateUserStatusMutation,
} from "@/features/dashboard/api";
import { buildUsersColumns, canActorManage } from "@/features/dashboard/components/users-columns";
import { UserEditDialog } from "@/features/dashboard/components/user-edit-dialog";
import { UserSessionsDialog } from "@/features/dashboard/components/user-sessions-dialog";
import { InviteAdminDialog } from "@/features/dashboard/components/invite-admin-dialog";
import { AdminUser, UserStatus } from "@/features/dashboard/types";

const roleOptions = [
    { value: UserRole.USER, label: "User" },
    { value: UserRole.ADMIN, label: "Admin" },
    { value: UserRole.SUPER_ADMIN, label: "Super admin" },
];

const statusOptions = [
    { value: UserStatus.ACTIVE, label: "Active" },
    { value: UserStatus.PENDING_VERIFICATION, label: "Pending verification" },
    { value: UserStatus.SUSPENDED, label: "Suspended" },
];

const UsersTableInner = () => {
    const { pagination, setPagination, searchTerm, columnFilters } = useDataTableUrlState({ defaultPageSize: 20 });
    const alert = useAlert();
    const actorRole = useAuthStore((state) => state.user?.role);

    const [view, setView] = useState<"active" | "deleted">("active");
    const [editing, setEditing] = useState<AdminUser | null>(null);
    const [viewingSessions, setViewingSessions] = useState<AdminUser | null>(null);

    const handleViewChange = (next: string) => {
        setView(next as "active" | "deleted");
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    const params = useMemo<QueryParams>(() => {
        const role = columnFilters.find((f) => f.id === "role")?.value;
        const status = columnFilters.find((f) => f.id === "status")?.value;
        return {
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            search: searchTerm || undefined,
            role: Array.isArray(role) ? role[0] : role,
            status: view === "deleted" ? undefined : Array.isArray(status) ? status[0] : status,
            deleted: view === "deleted" ? "true" : undefined,
        };
    }, [pagination, searchTerm, columnFilters, view]);

    const { data, isLoading } = useAdminUsers(params);

    const updateStatus = useUpdateUserStatusMutation();
    const triggerReset = useTriggerPasswordResetMutation();
    const softDelete = useSoftDeleteAdminUserMutation();
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

    const handleDelete = (user: AdminUser) => {
        alert.fire({
            title: "Delete this user?",
            text: "This soft-deletes the account. You can restore it later.",
            confirmButtonOptions: { variant: "destructive", text: "Delete" },
            showCancelButton: true,
            onConfirm: async () => {
                await softDelete.mutateAsync(user.id);
                toast.add({ title: "User deleted" });
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
                canManage: (user) => canActorManage(actorRole, user),
                onEdit: setEditing,
                onToggleStatus: handleToggleStatus,
                onViewSessions: setViewingSessions,
                onResetPassword: handleResetPassword,
                onDelete: handleDelete,
                onRestore: handleRestore,
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [actorRole, view]
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
                        <DataTableFacetedFilter columnId="role" title="Role" options={roleOptions} />
                        {view === "active" && (
                            <DataTableFacetedFilter columnId="status" title="Status" options={statusOptions} />
                        )}
                    </>
                }
                actions={actorRole === UserRole.SUPER_ADMIN ? <InviteAdminDialog /> : undefined}
            />
            <DataTable<AdminUser>
                isLoading={isLoading}
                emptyTitle="No users found"
                emptyDescription="Try adjusting your search or filters."
                onRowClick={(user) => (canActorManage(actorRole, user) ? setEditing(user) : undefined)}
            />
            <UserEditDialog
                user={editing}
                canEditRole={actorRole === UserRole.SUPER_ADMIN}
                onOpenChange={(open) => !open && setEditing(null)}
            />
            <UserSessionsDialog user={viewingSessions} onOpenChange={(open) => !open && setViewingSessions(null)} />
        </DataTableProvider>
    );
};

export const UsersTable = () => <UsersTableInner />;
