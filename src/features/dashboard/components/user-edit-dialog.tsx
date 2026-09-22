"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { FormInput } from "@/components/shared/form-input";
import { FormSelect } from "@/components/shared/form-select";
import { LoadingButton } from "@/components/shared/loading-button";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { UserRole } from "@/features/auth/types";
import { useUpdateAdminUserMutation } from "@/features/dashboard/api";
import { adminUpdateUserFormSchema, AdminUpdateUserFormValues } from "@/features/dashboard/schemas";
import { AdminUser } from "@/features/dashboard/types";

type UserEditDialogProps = {
    user: AdminUser | null;
    canEditRole: boolean;
    onOpenChange: (open: boolean) => void;
};

export const UserEditDialog = ({ user, canEditRole, onOpenChange }: UserEditDialogProps) => {
    const { control, handleSubmit, reset, formState } = useForm<AdminUpdateUserFormValues>({
        resolver: zodResolver(adminUpdateUserFormSchema),
        defaultValues: { email: "", name: "", username: "", phone: "", role: UserRole.USER },
    });

    useEffect(() => {
        if (!user) return;
        reset({
            email: user.email,
            name: user.name ?? "",
            username: user.username,
            phone: user.phone ?? "",
            role: user.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER,
        });
    }, [user, reset]);

    const updateUser = useUpdateAdminUserMutation(user?.id ?? "");

    const onSubmit = handleSubmit(async (values) => {
        const payload: Record<string, unknown> = {};
        if (values.email && values.email !== user?.email) payload.email = values.email;
        if (values.name && values.name !== user?.name) payload.name = values.name;
        if (values.username && values.username !== user?.username) payload.username = values.username;
        if (values.phone && values.phone !== user?.phone) payload.phone = values.phone;
        if (canEditRole && values.role !== user?.role) payload.role = values.role;

        try {
            await updateUser.mutateAsync(payload);
            toast.add({ title: "User updated" });
            onOpenChange(false);
        } catch (error) {
            toast.add({
                title: "Update failed",
                description: error instanceof ApiError ? error.message : "Something went wrong",
                type: "error",
            });
        }
    });

    return (
        <ResponsiveDialog
            open={!!user}
            onOpenChange={onOpenChange}
            title="Edit user"
            description={user ? `Update details for ${user.email}` : undefined}
            footer={
                <>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <LoadingButton onClick={onSubmit} isLoading={formState.isSubmitting}>
                        Save changes
                    </LoadingButton>
                </>
            }
        >
            <form onSubmit={onSubmit} noValidate>
                <FieldGroup>
                    <FormInput control={control} name="name" label="Name" placeholder="Full name" />
                    <FormInput control={control} name="username" label="Username" placeholder="username" />
                    <FormInput control={control} name="email" type="email" label="Email" placeholder="user@example.com" />
                    <FormInput control={control} name="phone" label="Phone" placeholder="+1 555 000 0000" />
                    {canEditRole && (
                        <FormSelect
                            control={control}
                            name="role"
                            label="Role"
                            options={[
                                { value: UserRole.USER, label: "User" },
                                { value: UserRole.ADMIN, label: "Admin" },
                            ]}
                        />
                    )}
                </FieldGroup>
            </form>
        </ResponsiveDialog>
    );
};
