"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormOTPInput } from "@/components/shared/form-OTP-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup } from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { useEnable2faMutation } from "@/features/two-factor/api";
import { enable2faFormSchema, Enable2faFormValues } from "@/features/two-factor/schemas";
import { Setup2faResponse } from "@/features/two-factor/types";
import { ApiError } from "@/lib/api-client";

type EnableTwoFactorDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    setupData: Setup2faResponse | null;
    onEnabled: () => void;
};

/** Two-step "enable 2FA" flow: scan the QR + confirm a code, then acknowledge the one-time recovery codes. */
export const EnableTwoFactorDialog = ({ open, onOpenChange, setupData, onEnabled }: EnableTwoFactorDialogProps) => {
    const enable2fa = useEnable2faMutation();
    const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
    const [acknowledged, setAcknowledged] = useState(false);

    const { control, handleSubmit, reset } = useForm<Enable2faFormValues>({
        resolver: zodResolver(enable2faFormSchema),
        defaultValues: { code: "" },
    });

    const handleOpenChange = (nextOpen: boolean) => {
        // Once the recovery codes are shown, the dialog can only be dismissed via the explicit "Done" button below.
        if (!nextOpen && recoveryCodes && !acknowledged) return;
        if (!nextOpen) {
            setRecoveryCodes(null);
            setAcknowledged(false);
            reset();
        }
        onOpenChange(nextOpen);
    };

    const onSubmit = handleSubmit(async (values) => {
        try {
            const result = await enable2fa.mutateAsync({ code: values.code });
            setRecoveryCodes(result.recoveryCodes);
        } catch (error) {
            toast.add({
                title: "Couldn't enable two-factor authentication",
                description: error instanceof ApiError ? error.message : "Something went wrong",
                type: "error",
            });
        }
    });

    const handleCopyAll = async () => {
        if (!recoveryCodes) return;
        await navigator.clipboard.writeText(recoveryCodes.join("\n"));
        toast.add({ title: "Recovery codes copied" });
    };

    const handleCopySecret = async () => {
        if (!setupData) return;
        await navigator.clipboard.writeText(setupData.otpauthUrl);
        toast.add({ title: "Setup key copied" });
    };

    const handleDone = () => {
        setRecoveryCodes(null);
        setAcknowledged(false);
        reset();
        onOpenChange(false);
        onEnabled();
    };

    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={handleOpenChange}
            title={recoveryCodes ? "Save your recovery codes" : "Enable two-factor authentication"}
            description={
                recoveryCodes
                    ? "Store these codes somewhere safe. Each one can be used once to sign in if you lose access to your authenticator app."
                    : "Scan the QR code with your authenticator app, then enter the 6-digit code it generates."
            }
        >
            {recoveryCodes ? (
                <FieldGroup>
                    <div className="grid grid-cols-2 gap-2 rounded-md border p-4 font-mono text-sm">
                        {recoveryCodes.map((recoveryCode) => (
                            <span key={recoveryCode}>{recoveryCode}</span>
                        ))}
                    </div>
                    <Button type="button" variant="outline" onClick={handleCopyAll}>
                        Copy all codes
                    </Button>
                    <label className="flex items-start gap-2">
                        <Checkbox
                            checked={acknowledged}
                            onCheckedChange={(checked) => setAcknowledged(checked === true)}
                        />
                        <Text variant="small">I&apos;ve saved these recovery codes somewhere safe.</Text>
                    </label>
                    <LoadingButton type="button" className="w-full" disabled={!acknowledged} onClick={handleDone}>
                        Done
                    </LoadingButton>
                </FieldGroup>
            ) : (
                <FieldGroup>
                    {setupData && (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={setupData.qrCodeDataUrl}
                                alt="Two-factor authentication QR code"
                                width={200}
                                height={200}
                                className="mx-auto rounded-md border"
                            />
                            <div className="flex flex-col gap-1.5">
                                <Text variant="small" tone="muted">
                                    Can&apos;t scan? Enter this setup key manually:
                                </Text>
                                <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2">
                                    <Text variant="small" className="break-all font-mono">
                                        {setupData.otpauthUrl}
                                    </Text>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={handleCopySecret}>
                                    Copy setup key
                                </Button>
                            </div>
                        </>
                    )}
                    <form onSubmit={onSubmit} noValidate>
                        <FieldGroup>
                            <FormOTPInput
                                control={control}
                                name="code"
                                length={6}
                                pattern="\d*"
                                label="Authenticator code"
                            />
                            <LoadingButton type="submit" className="w-full" isLoading={enable2fa.isPending}>
                                Confirm and enable
                            </LoadingButton>
                        </FieldGroup>
                    </form>
                </FieldGroup>
            )}
        </ResponsiveDialog>
    );
};
