"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserPlusIcon } from "lucide-react";

import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { FormInput } from "@/components/shared/form-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { useInviteAdminMutation } from "@/features/dashboard/api";
import { inviteAdminFormSchema, InviteAdminFormValues } from "@/features/dashboard/schemas";

export const InviteAdminDialog = () => {
    const [open, setOpen] = useState(false);
    const { control, handleSubmit, reset, formState } = useForm<InviteAdminFormValues>({
        resolver: zodResolver(inviteAdminFormSchema),
        defaultValues: { email: "" },
    });
    const inviteAdmin = useInviteAdminMutation();

    const onSubmit = handleSubmit(async (values) => {
        try {
            await inviteAdmin.mutateAsync(values.email);
            toast.add({ title: "Admin invited", description: `An invite was sent to ${values.email}` });
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
                Invite admin
            </Button>
            <ResponsiveDialog
                open={open}
                onOpenChange={setOpen}
                title="Invite a new admin"
                description="They'll receive an email to set up their admin account."
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
                            placeholder="new-admin@example.com"
                            required
                        />
                    </FieldGroup>
                </form>
            </ResponsiveDialog>
        </>
    );
};
