"use client";

import { MoreHorizontalIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { DataTableColumnDef } from "@/components/table/features";
import { AdminUser, UserStatus } from "@/features/dashboard/types";
import { ROLE_IDS } from "@/features/auth/types";

/** Display text for the seeded system roles; runtime-created roles fall back to their slug. */
const ROLE_LABELS: Record<string, string> = {
    [ROLE_IDS.USER]: "User",
    [ROLE_IDS.ADMIN]: "Admin",
    [ROLE_IDS.SUPER_ADMIN]: "Super admin",
};

const statusVariant: Record<UserStatus, "default" | "secondary" | "destructive"> = {
    [UserStatus.ACTIVE]: "default",
    [UserStatus.PENDING_VERIFICATION]: "secondary",
    [UserStatus.SUSPENDED]: "destructive",
};

/** Mirrors the backend's `DELETED_USER_GRACE_DAYS` default (see nestjs-starter `.env.example`). */
const DELETED_USER_GRACE_DAYS = 15;

type UsersColumnsOptions = {
    view: "active" | "deleted";
    canManage: (user: AdminUser) => boolean;
    onEdit: (user: AdminUser) => void;
    onToggleStatus: (user: AdminUser) => void;
    onViewSessions: (user: AdminUser) => void;
    onResetPassword: (user: AdminUser) => void;
    onRestore: (user: AdminUser) => void;
};

export const buildUsersColumns = ({
    view,
    canManage,
    onEdit,
    onToggleStatus,
    onViewSessions,
    onResetPassword,
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
        accessorKey: "roleIds",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Roles" />,
        filterFn: "arrHas",
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
                {row.original.roleIds.map((roleId) => (
                    <Badge key={roleId} variant="outline">
                        {ROLE_LABELS[roleId] ?? roleId}
                    </Badge>
                ))}
            </div>
        ),
    },
    ...(view === "active"
        ? [
              {
                  accessorKey: "status",
                  header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
                  filterFn: "arrHas",
                  cell: ({ row }) => (
                      <Badge variant={statusVariant[row.original.status]}>
                          {row.original.status.replace("_", " ")}
                      </Badge>
                  ),
              } satisfies DataTableColumnDef<AdminUser>,
          ]
        : []),
    {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
        cell: ({ row }) => (
            <Text variant="small" tone="muted">
                {new Date(row.original.createdAt).toLocaleDateString()}
            </Text>
        ),
    },
    ...(view === "deleted"
        ? [
              {
                  accessorKey: "deletedAt",
                  header: ({ column }) => <DataTableColumnHeader column={column} title="Purge in" />,
                  cell: ({ row }) => {
                      if (!row.original.deletedAt) return null;
                      const purgeDate = new Date(row.original.deletedAt);
                      purgeDate.setDate(purgeDate.getDate() + DELETED_USER_GRACE_DAYS);
                      const daysLeft = Math.max(
                          0,
                          Math.ceil((purgeDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
                      );
                      return (
                          <Text variant="small" tone="muted">
                              {daysLeft} day{daysLeft === 1 ? "" : "s"} left
                          </Text>
                      );
                  },
              } satisfies DataTableColumnDef<AdminUser>,
          ]
        : []),
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
                        {/* No delete action: the backend has no admin-delete route by design —
                            admins suspend, and only an owner can delete their own account.
                            Restore exists for owner-deleted accounts still in their grace period. */}
                        {isDeleted && (
                            <DropdownMenuItem onClick={() => onRestore(user)}>Restore</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

/**
 * `GET /admin/users` already filters to accounts ranked strictly below the
 * actor, plus the actor themselves — so anything that reaches this table is
 * manageable except the actor's own row, which the admin routes reject.
 */
export const canActorManage = (actorId: string | undefined, target: AdminUser) =>
    !!actorId && target.id !== actorId;
