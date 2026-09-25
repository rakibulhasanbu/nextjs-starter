"use client";

import { useState } from "react";

import { MoreHorizontalIcon, PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { useAlert } from "@/hooks/use-alert";
import { ApiError } from "@/lib/api-client";
import { useMe } from "@/features/account/api";
import { hasPermission, PERMISSIONS } from "@/features/auth/types";
import { useDeleteRoleMutation, useRoles } from "@/features/roles/api";
import { RoleFormDialog } from "@/features/roles/components/role-form-dialog";
import { Role } from "@/features/roles/types";

export const RolesList = () => {
    const { data: me } = useMe();
    const { data: roles, isLoading } = useRoles();
    const deleteRole = useDeleteRoleMutation();
    const alert = useAlert();

    const [editing, setEditing] = useState<Role | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Gate on the permission the backend actually checks, not on a role name —
    // roles are created at runtime and their contents are editable.
    const canWrite = hasPermission(me?.permissions, PERMISSIONS.ROLE_WRITE);
    const grantablePermissions = me?.permissions ?? [];

    const openCreate = () => {
        setEditing(null);
        setIsDialogOpen(true);
    };

    const openEdit = (role: Role) => {
        setEditing(role);
        setIsDialogOpen(true);
    };

    const handleDelete = (role: Role) => {
        alert.fire({
            title: `Delete the "${role.name}" role?`,
            text: "This cannot be undone.",
            confirmButtonOptions: { variant: "destructive", text: "Delete" },
            showCancelButton: true,
            onConfirm: async () => {
                try {
                    await deleteRole.mutateAsync(role.id);
                    toast.add({ title: "Role deleted" });
                } catch (error) {
                    toast.add({
                        title: "Couldn't delete role",
                        description: error instanceof ApiError ? error.message : "Something went wrong",
                        type: "error",
                    });
                }
            },
        });
    };

    return (
        <>
            <PageHeader
                title="Roles"
                description="Roles bundle permissions. Rank decides who can manage whom."
                actions={
                    canWrite ? (
                        <Button onClick={openCreate}>
                            <PlusIcon data-icon="inline-start" />
                            New role
                        </Button>
                    ) : undefined
                }
            />

            <Card className="shadow-card">
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-48 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Rank</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead>Users</TableHead>
                                    <TableHead className="w-0" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles?.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="flex items-center gap-2">
                                                    <Text variant="small" weight="medium">
                                                        {role.name}
                                                    </Text>
                                                    {role.isSystem && <Badge variant="secondary">System</Badge>}
                                                </span>
                                                <Text variant="small" tone="muted">
                                                    {role.description || role.id}
                                                </Text>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Text variant="small" tone="muted">
                                                {role.rank}
                                            </Text>
                                        </TableCell>
                                        <TableCell>
                                            <Text variant="small" tone="muted">
                                                {role.permissions.length}
                                            </Text>
                                        </TableCell>
                                        <TableCell>
                                            <Text variant="small" tone="muted">
                                                {role.userCount}
                                            </Text>
                                        </TableCell>
                                        <TableCell>
                                            {canWrite && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        render={
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                aria-label="Role actions"
                                                            >
                                                                <MoreHorizontalIcon />
                                                            </Button>
                                                        }
                                                    />
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEdit(role)}>
                                                            Edit
                                                        </DropdownMenuItem>
                                                        {/* System roles are undeletable, and the backend
                                                            refuses to drop a role that still has holders. */}
                                                        {!role.isSystem && role.userCount === 0 && (
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() => handleDelete(role)}
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <RoleFormDialog
                open={isDialogOpen}
                role={editing}
                grantablePermissions={grantablePermissions}
                onOpenChange={setIsDialogOpen}
            />
        </>
    );
};
