"use client";

import { useEffect, useState } from "react";

import { usePasskeys, useRegisterPasskeyMutation, useRemovePasskeyMutation } from "@/features/passkeys/api";
import { KeyRoundIcon, Trash2Icon } from "lucide-react";

import { ApiError } from "@/lib/api-client";
import { useAlert } from "@/hooks/use-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { LoadingButton } from "@/components/shared/loading-button";

const describeError = (error: unknown) => {
    if (error instanceof ApiError) return error.message;
    // startRegistration throws a DOMException when the user dismisses the
    // browser's prompt — that's a cancellation, not a failure worth alarming about.
    if (error instanceof Error) return error.message;
    return "Something went wrong";
};

/** A label the user can recognise later in the list. */
const currentDeviceName = () =>
    typeof navigator === "undefined" ? "This device" : navigator.userAgent.split(")")[0].split("(")[1] || "This device";

export const PasskeysCard = () => {
    const { data: passkeys, isLoading } = usePasskeys();
    const registerPasskey = useRegisterPasskeyMutation();
    const removePasskey = useRemovePasskeyMutation();
    const alert = useAlert();

    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Checked in an effect rather than during render: it touches `window`,
        // which does not exist during the server render.
        import("@simplewebauthn/browser").then(({ browserSupportsWebAuthn }) =>
            setIsSupported(browserSupportsWebAuthn())
        );
    }, []);

    const handleAdd = async () => {
        try {
            await registerPasskey.mutateAsync(currentDeviceName());
            toast.add({ title: "Passkey added" });
        } catch (error) {
            if (error instanceof Error && error.name === "NotAllowedError") return; // user dismissed the prompt
            toast.add({ title: "Couldn't add passkey", description: describeError(error), type: "error" });
        }
    };

    const handleRemove = (credentialId: string, label: string) => {
        alert.fire({
            title: `Remove ${label}?`,
            text: "That device will no longer be able to sign in with a passkey.",
            confirmButtonOptions: { variant: "destructive", text: "Remove" },
            showCancelButton: true,
            onConfirm: async () => {
                try {
                    await removePasskey.mutateAsync(credentialId);
                    toast.add({ title: "Passkey removed" });
                } catch (error) {
                    toast.add({
                        title: "Couldn't remove passkey",
                        description: describeError(error),
                        type: "error",
                    });
                }
            },
        });
    };

    return (
        <Card className="shadow-card">
            <CardHeader>
                <CardTitle>Passkeys</CardTitle>
                <CardDescription>
                    Sign in with your fingerprint, face or device PIN instead of a password.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                ) : passkeys?.length ? (
                    <ul className="flex flex-col gap-2">
                        {passkeys.map((passkey) => {
                            const label = passkey.deviceName || "Unnamed device";
                            return (
                                <li key={passkey.id} className="flex items-center gap-3 rounded-md border p-3">
                                    <KeyRoundIcon className="size-4 shrink-0 text-muted-foreground" />
                                    <div className="flex flex-1 flex-col">
                                        <Text variant="small" weight="medium">
                                            {label}
                                        </Text>
                                        <Text variant="small" tone="muted">
                                            Added {new Date(passkey.createdAt).toLocaleDateString()}
                                            {passkey.lastUsedAt
                                                ? ` · last used ${new Date(passkey.lastUsedAt).toLocaleDateString()}`
                                                : " · never used"}
                                        </Text>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Remove ${label}`}
                                        onClick={() => handleRemove(passkey.credentialId, label)}
                                    >
                                        <Trash2Icon />
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <Text variant="small" tone="muted">
                        No passkeys yet.
                    </Text>
                )}

                {isSupported ? (
                    <LoadingButton onClick={handleAdd} isLoading={registerPasskey.isPending} className="self-start">
                        Add a passkey
                    </LoadingButton>
                ) : (
                    <Text variant="small" tone="muted">
                        This browser doesn&apos;t support passkeys.
                    </Text>
                )}
            </CardContent>
        </Card>
    );
};
