"use client";

import { useMySessions, useRevokeAllSessionsMutation, useRevokeSessionMutation } from "@/features/account/api";
import { useAuthStore } from "@/store/auth-store";
import { MonitorIcon } from "lucide-react";

import { useAlert } from "@/hooks/use-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";

export const SessionsList = () => {
    const alert = useAlert();
    const { data: sessions, isLoading } = useMySessions();
    const revokeSession = useRevokeSessionMutation();
    const revokeAll = useRevokeAllSessionsMutation();

    /** Revoking your own row is a sign-out, so it ends the session here instead of leaving a dead UI behind. */
    const handleRevoke = async (sessionId: string, isCurrent: boolean) => {
        await revokeSession.mutateAsync(sessionId);
        if (isCurrent) {
            toast.add({ title: "Signed out", description: "Sign in again to continue." });
            await useAuthStore.getState().logoutWithReload();
        }
    };

    const handleRevokeAll = () => {
        alert.fire({
            title: "Sign out of all devices?",
            text: "This includes this one — every session is revoked and you'll need to sign in again.",
            confirmButtonOptions: { variant: "destructive", text: "Revoke all" },
            showCancelButton: true,
            onConfirm: async () => {
                await revokeAll.mutateAsync();
                // The backend revokes every refresh token and bumps tokenVersion,
                // so this session is gone too — end it here rather than letting
                // the next request fail its way to a logout.
                toast.add({ title: "All sessions revoked", description: "Sign in again to continue." });
                await useAuthStore.getState().logoutWithReload();
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
                    Sign out all devices
                </Button>
            )}
            <div className="flex flex-col gap-2">
                {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Text variant="small" weight="medium">
                                    {session.deviceName || session.deviceType || "Unknown device"}
                                </Text>
                                {session.isCurrent && <Badge variant="secondary">This device</Badge>}
                            </div>
                            <Text variant="small" tone="muted">
                                {session.ipAddress ?? "Unknown IP"} · last active{" "}
                                {new Date(session.lastUsedAt).toLocaleString()}
                            </Text>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={revokeSession.isPending}
                            onClick={() => void handleRevoke(session.id, session.isCurrent)}
                        >
                            {session.isCurrent ? "Sign out" : "Revoke"}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};
