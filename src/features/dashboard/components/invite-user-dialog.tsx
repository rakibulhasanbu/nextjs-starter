"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { UserPlusIcon } from "lucide-react";

import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { FormInput } from "@/components/shared/form-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { useInviteUserMutation } from "@/features/dashboard/api";
import { inviteUserFormSchema, InviteUserFormValues } from "@/features/dashboard/schemas";
import { RoleCheckboxList } from "@/features/roles/components/role-checkbox-list";

export const InviteUserDialog = () => {
    const [open, setOpen] = useState(false);
    const { control, handleSubmit, reset, formState } = useForm<InviteUserFormValues>({
        resolver: zodResolver(inviteUserFormSchema),
        defaultValues: { email: "", roleIds: [] },
    });
    const inviteUser = useInviteUserMutation();

    const onSubmit = handleSubmit(async (values) => {
        try {
            // The baseline `user` role is added server-side, so only elevated roles travel here.
            await inviteUser.mutateAsync({ email: values.email, roleIds: values.roleIds });
            toast.add({ title: "Invite sent", description: `An invite was sent to ${values.email}` });
            reset();
            setOpen(false);
        } catch (error) {
            toast.add({
                title: "Invite failed",
                description: error instanceof ApiError ? error.message : "Something went wrong",
                type: "error",
            });
        }
    });

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <UserPlusIcon data-icon="inline-start" />
                Invite user
            </Button>
            <ResponsiveDialog
                open={open}
                onOpenChange={setOpen}
                title="Invite a user"
                description="They'll receive an email with a code to set their password and finish setting up the account."
                footer={
                    <>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <LoadingButton onClick={onSubmit} isLoading={formState.isSubmitting}>
                            Send invite
                        </LoadingButton>
                    </>
                }
            >
                <form onSubmit={onSubmit} noValidate>
                    <FieldGroup>
                        <FormInput
                            control={control}
                            name="email"
                            type="email"
                            label="Email"
                            placeholder="new-user@example.com"
                            required
                        />
                        <Controller
                            control={control}
                            name="roleIds"
                            render={({ field }) => (
                                <RoleCheckboxList value={field.value} onChange={field.onChange} />
                            )}
                        />
                    </FieldGroup>
                </form>
            </ResponsiveDialog>
        </>
    );
};
