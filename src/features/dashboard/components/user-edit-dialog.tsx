"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { FormInput } from "@/components/shared/form-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { ROLE_IDS } from "@/features/auth/types";
import { RoleCheckboxList } from "@/features/roles/components/role-checkbox-list";
import { useAssignUserRolesMutation, useUpdateAdminUserMutation } from "@/features/dashboard/api";
import { adminUpdateUserFormSchema, AdminUpdateUserFormValues } from "@/features/dashboard/schemas";
import { AdminUpdateUserPayload, AdminUser } from "@/features/dashboard/types";

type UserEditDialogProps = {
    user: AdminUser | null;
    canEditRoles: boolean;
    onOpenChange: (open: boolean) => void;
};

/** The elevated roles the form can grant or revoke; `user` is the baseline everyone keeps. */
const elevatedRoleIds = (user: AdminUser | null) =>
    (user?.roleIds ?? []).filter((roleId) => roleId !== ROLE_IDS.USER);

const sameRoles = (a: string[], b: string[]) =>
    a.length === b.length && [...a].sort().join() === [...b].sort().join();

export const UserEditDialog = ({ user, canEditRoles, onOpenChange }: UserEditDialogProps) => {
    const { control, handleSubmit, reset, formState } = useForm<AdminUpdateUserFormValues>({
        resolver: zodResolver(adminUpdateUserFormSchema),
        defaultValues: { email: "", name: "", username: "", phone: "", roleIds: [] },
    });

    useEffect(() => {
        if (!user) return;
        reset({
            email: user.email,
            name: user.name ?? "",
            username: user.username,
            phone: user.phone ?? "",
            roleIds: elevatedRoleIds(user),
        });
    }, [user, reset]);

    const updateUser = useUpdateAdminUserMutation(user?.id ?? "");
    const assignRoles = useAssignUserRolesMutation(user?.id ?? "");

    const onSubmit = handleSubmit(async (values) => {
        const payload: AdminUpdateUserPayload = {};
        if (values.email && values.email !== user?.email) payload.email = values.email;
        if (values.name && values.name !== user?.name) payload.name = values.name;
        if (values.username && values.username !== user?.username) payload.username = values.username;
        if (values.phone && values.phone !== user?.phone) payload.phone = values.phone;

        // Roles live behind their own endpoint and their own permission — the
        // details endpoint rejects a `roleId`/`roleIds` key outright.
        const rolesChanged = canEditRoles && !sameRoles(values.roleIds, elevatedRoleIds(user));

        try {
            if (Object.keys(payload).length > 0) await updateUser.mutateAsync(payload);
            if (rolesChanged) await assignRoles.mutateAsync(values.roleIds);
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
                    {canEditRoles && (
                        <Controller
                            control={control}
                            name="roleIds"
                            render={({ field }) => (
                                <RoleCheckboxList value={field.value} onChange={field.onChange} />
                            )}
                        />
                    )}
                </FieldGroup>
            </form>
        </ResponsiveDialog>
    );
};
