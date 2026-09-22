"use client";

import { MoreHorizontalIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { DataTableColumnDef } from "@/components/table/features";
import { AdminUser, UserStatus } from "@/features/dashboard/types";
import { UserRole } from "@/features/auth/types";

const statusVariant: Record<UserStatus, "default" | "secondary" | "destructive"> = {
    [UserStatus.ACTIVE]: "default",
    [UserStatus.PENDING_VERIFICATION]: "secondary",
    [UserStatus.SUSPENDED]: "destructive",
};

type UsersColumnsOptions = {
    canManage: (user: AdminUser) => boolean;
    onEdit: (user: AdminUser) => void;
    onToggleStatus: (user: AdminUser) => void;
    onViewSessions: (user: AdminUser) => void;
    onResetPassword: (user: AdminUser) => void;
    onDelete: (user: AdminUser) => void;
    onRestore: (user: AdminUser) => void;
};

export const buildUsersColumns = ({
    canManage,
    onEdit,
    onToggleStatus,
    onViewSessions,
    onResetPassword,
    onDelete,
    onRestore,
}: UsersColumnsOptions): DataTableColumnDef<AdminUser>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => (
            <div className="flex flex-col">
                <Text variant="small" weight="medium">
                    {row.original.name || row.original.username}
                </Text>
                <Text variant="small" tone="muted">
                    {row.original.email}
                </Text>
            </div>
        ),
    },
    {
        accessorKey: "role",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        filterFn: "arrHas",
        cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge>,
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        filterFn: "arrHas",
        cell: ({ row }) => (
            <Badge variant={statusVariant[row.original.status]}>{row.original.status.replace("_", " ")}</Badge>
        ),
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
        cell: ({ row }) => (
            <Text variant="small" tone="muted">
                {new Date(row.original.createdAt).toLocaleDateString()}
            </Text>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const user = row.original;
            if (!canManage(user)) return null;
            const isDeleted = !!user.deletedAt;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(event) => event.stopPropagation()}
                                aria-label="Row actions"
                            >
                                <MoreHorizontalIcon />
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                        {!isDeleted && <DropdownMenuItem onClick={() => onEdit(user)}>Edit</DropdownMenuItem>}
                        {!isDeleted && user.status !== UserStatus.PENDING_VERIFICATION && (
                            <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                                {user.status === UserStatus.ACTIVE ? "Suspend" : "Reactivate"}
                            </DropdownMenuItem>
                        )}
                        {!isDeleted && <DropdownMenuItem onClick={() => onViewSessions(user)}>Sessions</DropdownMenuItem>}
                        {!isDeleted && (
                            <DropdownMenuItem onClick={() => onResetPassword(user)}>
                                Send password reset
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {isDeleted ? (
                            <DropdownMenuItem onClick={() => onRestore(user)}>Restore</DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem variant="destructive" onClick={() => onDelete(user)}>
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

/** ADMIN actors may only manage plain USER accounts; SUPER_ADMIN manages everyone. */
export const canActorManage = (actorRole: UserRole | undefined, target: AdminUser) => {
    if (actorRole === UserRole.SUPER_ADMIN) return true;
    if (actorRole === UserRole.ADMIN) return target.role === UserRole.USER;
    return false;
};
