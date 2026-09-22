"use client";

import { MonitorIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useAlert } from "@/hooks/use-alert";
import { toast } from "@/components/ui/toast";
import { useMySessions, useRevokeAllSessionsMutation, useRevokeSessionMutation } from "@/features/account/api";

export const SessionsList = () => {
    const alert = useAlert();
    const { data: sessions, isLoading } = useMySessions();
    const revokeSession = useRevokeSessionMutation();
    const revokeAll = useRevokeAllSessionsMutation();

    const handleRevokeAll = () => {
        alert.fire({
            title: "Sign out of all other devices?",
            text: "You'll stay signed in here; every other session is revoked.",
            confirmButtonOptions: { variant: "destructive", text: "Revoke all" },
            showCancelButton: true,
            onConfirm: async () => {
                await revokeAll.mutateAsync();
                toast.add({ title: "All sessions revoked" });
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    }

    if (!sessions || sessions.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <MonitorIcon />
                    </EmptyMedia>
                    <EmptyTitle>No active sessions</EmptyTitle>
                    <EmptyDescription>You&apos;re not signed in anywhere right now.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {sessions.length > 1 && (
                <Button variant="outline" size="sm" className="self-end" onClick={handleRevokeAll}>
                    Sign out all other devices
                </Button>
            )}
            <div className="flex flex-col gap-2">
                {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
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
        </div>
    );
};
