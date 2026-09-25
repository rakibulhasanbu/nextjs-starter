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
import { PermissionKey } from "@/features/auth/types";
import { useCreateRoleMutation, useUpdateRoleMutation } from "@/features/roles/api";
import { roleFormSchema, RoleFormValues } from "@/features/roles/schemas";
import { Role } from "@/features/roles/types";
import { PermissionPicker } from "@/features/roles/components/permission-picker";

type RoleFormDialogProps = {
    open: boolean;
    /** `null` opens the dialog in create mode. */
    role: Role | null;
    /** Permissions the actor holds — the backend refuses to grant any they lack. */
    grantablePermissions: PermissionKey[];
    onOpenChange: (open: boolean) => void;
};

const emptyValues: RoleFormValues = { id: "", name: "", description: "", rank: "0", permissions: [] };

export const RoleFormDialog = ({
    open,
    role,
    grantablePermissions,
    onOpenChange,
}: RoleFormDialogProps) => {
    const isEditing = !!role;

    const { control, handleSubmit, reset, formState } = useForm<RoleFormValues>({
        resolver: zodResolver(roleFormSchema),
        defaultValues: emptyValues,
    });

    useEffect(() => {
        if (!open) return;
        reset(
            role
                ? {
                      id: role.id,
                      name: role.name,
                      description: role.description ?? "",
                      rank: String(role.rank),
                      permissions: role.permissions,
                  }
                : emptyValues
        );
    }, [open, role, reset]);

    const createRole = useCreateRoleMutation();
    const updateRole = useUpdateRoleMutation(role?.id ?? "");

    const onSubmit = handleSubmit(async (values) => {
        try {
            if (role) {
                // A system role's name and rank are fixed — sending either is a 403,
                // so only the editable fields travel for those.
                await updateRole.mutateAsync({
                    description: values.description || undefined,
                    permissions: values.permissions as PermissionKey[],
                    ...(role.isSystem ? {} : { name: values.name, rank: Number(values.rank) }),
                });
                toast.add({ title: "Role updated" });
            } else {
                await createRole.mutateAsync({
                    id: values.id,
                    name: values.name,
                    description: values.description || undefined,
                    rank: Number(values.rank),
                    permissions: values.permissions as PermissionKey[],
                });
                toast.add({ title: "Role created" });
            }
            onOpenChange(false);
        } catch (error) {
            toast.add({
                title: isEditing ? "Couldn't update role" : "Couldn't create role",
                description: error instanceof ApiError ? error.message : "Something went wrong",
                type: "error",
            });
        }
    });

    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={onOpenChange}
            title={isEditing ? "Edit role" : "New role"}
            description={
                role?.isSystem
                    ? "This is a system role — its name and rank are fixed, but its permissions are yours to change."
                    : "Roles bundle permissions. Rank decides who can manage whom."
            }
            footer={
                <>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <LoadingButton onClick={onSubmit} isLoading={formState.isSubmitting}>
                        {isEditing ? "Save changes" : "Create role"}
                    </LoadingButton>
                </>
            }
        >
            <form onSubmit={onSubmit} noValidate>
                <FieldGroup>
                    <FormInput
                        control={control}
                        name="id"
                        label="Id"
                        placeholder="content_editor"
                        description={
                            isEditing
                                ? "Ids are permanent — code and existing assignments reference them."
                                : "Lowercase letters, digits and underscores. Cannot be changed later."
                        }
                        disabled={isEditing}
                        required
                    />
                    <FormInput
                        control={control}
                        name="name"
                        label="Name"
                        placeholder="Content editor"
                        disabled={role?.isSystem}
                        required
                    />
                    <FormInput
                        control={control}
                        name="description"
                        label="Description"
                        placeholder="What this role is for"
                    />
                    <FormInput
                        control={control}
                        name="rank"
                        type="number"
                        label="Rank"
                        placeholder="0"
                        description="Higher outranks lower. Must be below your own rank."
                        disabled={role?.isSystem}
                        required
                    />
                    <Controller
                        control={control}
                        name="permissions"
                        render={({ field }) => (
                            <PermissionPicker
                                grantablePermissions={grantablePermissions}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </FieldGroup>
            </form>
        </ResponsiveDialog>
    );
};
