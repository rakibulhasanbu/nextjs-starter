"use client";

import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useAlert } from "@/hooks/use-alert";
import { toast } from "@/components/ui/toast";
import { MonitorIcon } from "lucide-react";
import {
    useAdminUserSessions,
    useRevokeAdminUserSessionMutation,
    useRevokeAllAdminUserSessionsMutation,
} from "@/features/dashboard/api";
import { AdminUser } from "@/features/dashboard/types";

type UserSessionsDialogProps = {
    user: AdminUser | null;
    onOpenChange: (open: boolean) => void;
};

export const UserSessionsDialog = ({ user, onOpenChange }: UserSessionsDialogProps) => {
    const alert = useAlert();
    const { data: sessions, isLoading } = useAdminUserSessions(user?.id ?? "");
    const revokeSession = useRevokeAdminUserSessionMutation(user?.id ?? "");
    const revokeAll = useRevokeAllAdminUserSessionsMutation(user?.id ?? "");

    const handleRevokeAll = () => {
        alert.fire({
            title: "Revoke all sessions?",
            text: "This immediately signs the user out on every device.",
            confirmButtonOptions: { variant: "destructive", text: "Revoke all" },
            showCancelButton: true,
            onConfirm: async () => {
                await revokeAll.mutateAsync();
                toast.add({ title: "All sessions revoked" });
            },
        });
    };

    return (
        <ResponsiveDialog
            open={!!user}
            onOpenChange={onOpenChange}
            title="Active sessions"
            description={user ? `Devices currently signed in as ${user.email}` : undefined}
            footer={
                sessions && sessions.length > 0 ? (
                    <Button variant="destructive" onClick={handleRevokeAll} disabled={revokeAll.isPending}>
                        Revoke all
                    </Button>
                ) : undefined
            }
        >
            {isLoading ? (
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                </div>
            ) : !sessions || sessions.length === 0 ? (
                <Empty className="border-none p-0">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <MonitorIcon />
                        </EmptyMedia>
                        <EmptyTitle>No active sessions</EmptyTitle>
                        <EmptyDescription>This user isn&apos;t signed in anywhere right now.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="flex flex-col gap-2">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between gap-3 rounded-lg border p-3"
                        >
                            <div className="flex flex-col">
                                <Text variant="small" weight="medium">
                                    {session.deviceName || session.deviceType || "Unknown device"}
                                </Text>
                                <Text variant="small" tone="muted">
                                    {session.ipAddress ?? "Unknown IP"} · last active{" "}
                                    {new Date(session.lastUsedAt).toLocaleString()}
                                </Text>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={revokeSession.isPending}
                                onClick={() => revokeSession.mutate(session.id)}
                            >
                                Revoke
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </ResponsiveDialog>
    );
};
