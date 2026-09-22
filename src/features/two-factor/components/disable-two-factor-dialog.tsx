"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/shared/form-input";
import { FormOTPInput } from "@/components/shared/form-OTP-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useDisable2faMutation } from "@/features/two-factor/api";
import { disable2faFormSchema, Disable2faFormValues } from "@/features/two-factor/schemas";
import { ApiError } from "@/lib/api-client";

type DisableTwoFactorDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDisabled: () => void;
};

export const DisableTwoFactorDialog = ({ open, onOpenChange, onDisabled }: DisableTwoFactorDialogProps) => {
    const disable2fa = useDisable2faMutation();

    const { control, handleSubmit, reset } = useForm<Disable2faFormValues>({
        resolver: zodResolver(disable2faFormSchema),
        defaultValues: { password: "", code: "" },
    });

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
    };

    const onSubmit = handleSubmit(async (values) => {
        try {
            await disable2fa.mutateAsync(values);
            reset();
            onOpenChange(false);
            toast.add({ title: "Two-factor authentication disabled" });
            onDisabled();
        } catch (error) {
            toast.add({
                title: "Couldn't disable two-factor authentication",
                description: error instanceof ApiError ? error.message : "Something went wrong",
                type: "error",
            });
        }
    });

    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={handleOpenChange}
            title="Disable two-factor authentication"
            description="Confirm your password and current authenticator code to turn off two-factor authentication."
        >
            <form onSubmit={onSubmit} noValidate>
                <FieldGroup>
                    <FormInput
                        control={control}
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                    />
                    <FormOTPInput control={control} name="code" length={6} pattern="\d*" label="Authenticator code" />
                    <LoadingButton
                        type="submit"
                        variant="destructive"
                        className="w-full"
                        isLoading={disable2fa.isPending}
                    >
                        Disable two-factor authentication
                    </LoadingButton>
                </FieldGroup>
            </form>
        </ResponsiveDialog>
    );
};
