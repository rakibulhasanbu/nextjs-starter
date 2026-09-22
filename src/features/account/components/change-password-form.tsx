"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/shared/form-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { useChangePasswordMutation } from "@/features/account/api";
import { changePasswordFormSchema, ChangePasswordFormValues } from "@/features/account/schemas";

export const ChangePasswordForm = () => {
    const changePassword = useChangePasswordMutation();

    const { control, handleSubmit, reset, formState } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordFormSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await changePassword.mutateAsync({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            toast.add({ title: "Password changed" });
            reset();
        } catch (error) {
            toast.add({
                title: "Change password failed",
                description: error instanceof ApiError ? error.message : "Something went wrong",
                type: "error",
            });
        }
    });

    return (
        <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
                <FormInput
                    control={control}
                    name="currentPassword"
                    type="password"
                    label="Current password"
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    required
                />
                <FormInput
                    control={control}
                    name="newPassword"
                    type="password"
                    label="New password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                />
                <FormInput
                    control={control}
                    name="confirmPassword"
                    type="password"
                    label="Confirm new password"
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    required
                />
                <LoadingButton type="submit" isLoading={formState.isSubmitting} className="self-start">
                    Change password
                </LoadingButton>
            </FieldGroup>
        </form>
    );
};
