"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/shared/form-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { useChangePasswordMutation, useMe, useSetPasswordMutation } from "@/features/account/api";
import { changePasswordFormSchema, ChangePasswordFormValues } from "@/features/account/schemas";
import { setPasswordFormSchema, SetPasswordFormValues } from "@/features/auth/schemas";
import { useAuthStore } from "@/store/auth-store";

const describeError = (error: unknown) =>
    error instanceof ApiError ? error.message : "Something went wrong";

/**
 * Accounts created through Google or a passkey have no password, and
 * change-password rejects them (it needs a current one to verify). `hasPassword`
 * on `/users/me` is what tells the two cases apart.
 */
export const ChangePasswordForm = () => {
    const { data: me, isLoading } = useMe();

    if (isLoading) return <Skeleton className="h-40 w-full" />;

    return me?.hasPassword === false ? <SetPasswordFields /> : <ChangePasswordFields />;
};

const SetPasswordFields = () => {
    const setPassword = useSetPasswordMutation();

    const { control, handleSubmit, reset, formState } = useForm<SetPasswordFormValues>({
        resolver: zodResolver(setPasswordFormSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await setPassword.mutateAsync(values.newPassword);
            toast.add({ title: "Password set", description: "You can now sign in with your email too." });
            reset();
        } catch (error) {
            toast.add({ title: "Couldn't set password", description: describeError(error), type: "error" });
        }
    });

    return (
        <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
                <Text variant="small" tone="muted">
                    You signed up without a password. Set one to be able to sign in with your email
                    address as well.
                </Text>
                <FormInput
                    control={control}
                    name="newPassword"
                    type="password"
                    label="Password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                />
                <FormInput
                    control={control}
                    name="confirmPassword"
                    type="password"
                    label="Confirm password"
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    required
                />
                <LoadingButton type="submit" isLoading={formState.isSubmitting} className="self-start">
                    Set password
                </LoadingButton>
            </FieldGroup>
        </form>
    );
};

const ChangePasswordFields = () => {
    const changePassword = useChangePasswordMutation();
    const logoutWithReload = useAuthStore((state) => state.logoutWithReload);

    const { control, handleSubmit, formState } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordFormSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await changePassword.mutateAsync({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            // The backend revokes every refresh token and bumps tokenVersion on a
            // successful change — including this session's. There is nothing left
            // to stay signed in with, so end it here rather than letting the next
            // request fail its way to a logout.
            toast.add({ title: "Password changed", description: "Sign in again with your new password." });
            await logoutWithReload();
        } catch (error) {
            toast.add({ title: "Change password failed", description: describeError(error), type: "error" });
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
