"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormOTPInput } from "@/components/shared/form-OTP-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useAlert } from "@/hooks/use-alert";
import { ApiError } from "@/lib/api-client";
import {
    useConfirmAccountDeletionMutation,
    useRequestAccountDeletionMutation,
} from "@/features/account/api";
import { deleteAccountOtpFormSchema, DeleteAccountOtpFormValues } from "@/features/account/schemas";
import { useAuthStore } from "@/store/auth-store";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";

export const DeleteAccountCard = () => {
    const alert = useAlert();
    const user = useAuthStore((state) => state.user);
    const requestDeletion = useRequestAccountDeletionMutation();
    const confirmDeletion = useConfirmAccountDeletionMutation();
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);

    const { control, handleSubmit, reset } = useForm<DeleteAccountOtpFormValues>({
        resolver: zodResolver(deleteAccountOtpFormSchema),
        defaultValues: { code: "" },
    });

    const handleDeleteClick = () => {
        alert.fire({
            title: "Delete your account?",
            text: "We'll email a 6-digit code to confirm. Deletion is permanent once the grace period ends and cannot be undone.",
            confirmButtonOptions: { variant: "destructive", text: "Send confirmation code" },
            showCancelButton: true,
            onConfirm: async () => {
                try {
                    await requestDeletion.mutateAsync();
                    reset();
                    setOtpDialogOpen(true);
                } catch (error) {
                    toast.add({
                        title: "Couldn't send confirmation code",
                        description: error instanceof ApiError ? error.message : "Something went wrong",
                        type: "error",
                    });
                }
            },
        });
    };

    const onSubmit = handleSubmit(async (values) => {
        try {
            await confirmDeletion.mutateAsync(values.code);
            setOtpDialogOpen(false);
            toast.add({ title: "Account deleted" });
            await useAuthStore.getState().logoutWithReload();
        } catch (error) {
            toast.add({
                title: "Deletion failed",
                description: error instanceof ApiError ? error.message : "Something went wrong",
                type: "error",
            });
        }
    });

    return (
        <>
            <LoadingButton
                type="button"
                variant="destructive"
                isLoading={requestDeletion.isPending}
                onClick={handleDeleteClick}
                className="self-start"
            >
                Delete account
            </LoadingButton>

            <ResponsiveDialog
                open={otpDialogOpen}
                onOpenChange={setOtpDialogOpen}
                title="Confirm account deletion"
                description={
                    user?.email
                        ? `Enter the 6-digit code sent to ${user.email}.`
                        : "Enter the 6-digit code we emailed you."
                }
            >
                <form onSubmit={onSubmit} noValidate>
                    <FieldGroup>
                        <FormOTPInput control={control} name="code" length={6} pattern="\d*" />
                        <LoadingButton
                            type="submit"
                            variant="destructive"
                            className="w-full"
                            isLoading={confirmDeletion.isPending}
                        >
                            Delete my account
                        </LoadingButton>
                    </FieldGroup>
                </form>
            </ResponsiveDialog>
        </>
    );
};
