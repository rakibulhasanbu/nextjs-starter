"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { LoadingButton } from "@/components/shared/loading-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { accountKeys, useMe } from "@/features/account/api";
import { DisableTwoFactorDialog } from "@/features/two-factor/components/disable-two-factor-dialog";
import { EnableTwoFactorDialog } from "@/features/two-factor/components/enable-two-factor-dialog";
import { useSetup2faMutation } from "@/features/two-factor/api";
import { Setup2faResponse } from "@/features/two-factor/types";
import { useAlert } from "@/hooks/use-alert";
import { ApiError } from "@/lib/api-client";

export const TwoFactorAuthCard = () => {
    const queryClient = useQueryClient();
    const alert = useAlert();
    const { data: user, isLoading } = useMe();
    const setup2fa = useSetup2faMutation();

    const [setupData, setSetupData] = useState<Setup2faResponse | null>(null);
    const [enableDialogOpen, setEnableDialogOpen] = useState(false);
    const [disableDialogOpen, setDisableDialogOpen] = useState(false);

    const handleEnableClick = async () => {
        try {
            const data = await setup2fa.mutateAsync();
            setSetupData(data);
            setEnableDialogOpen(true);
        } catch (error) {
            toast.add({
                title: "Couldn't start two-factor setup",
                description: error instanceof ApiError ? error.message : "Something went wrong",
                type: "error",
            });
        }
    };

    const handleDisableClick = () => {
        alert.fire({
            title: "Disable two-factor authentication?",
            text: "Your account will only be protected by your password. You'll need your password and a current authenticator code to confirm.",
            confirmButtonOptions: { variant: "destructive", text: "Continue" },
            showCancelButton: true,
            onConfirm: () => setDisableDialogOpen(true),
        });
    };

    const handleEnabled = () => {
        setSetupData(null);
        toast.add({ title: "Two-factor authentication enabled" });
        queryClient.invalidateQueries({ queryKey: accountKeys.me });
    };

    const handleDisabled = () => {
        queryClient.invalidateQueries({ queryKey: accountKeys.me });
    };

    const isEnabled = user?.twoFactorEnabled ?? false;

    return (
        <>
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Two-factor authentication
                        {!isLoading && (
                            <Badge variant={isEnabled ? "default" : "outline"}>
                                {isEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Require a code from an authenticator app in addition to your password when signing in.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEnabled ? (
                        <LoadingButton type="button" variant="destructive" onClick={handleDisableClick}>
                            Disable two-factor authentication
                        </LoadingButton>
                    ) : (
                        <LoadingButton type="button" isLoading={setup2fa.isPending} onClick={handleEnableClick}>
                            Enable two-factor authentication
                        </LoadingButton>
                    )}
                </CardContent>
            </Card>

            <EnableTwoFactorDialog
                open={enableDialogOpen}
                onOpenChange={setEnableDialogOpen}
                setupData={setupData}
                onEnabled={handleEnabled}
            />
            <DisableTwoFactorDialog
                open={disableDialogOpen}
                onOpenChange={setDisableDialogOpen}
                onDisabled={handleDisabled}
            />
        </>
    );
};
