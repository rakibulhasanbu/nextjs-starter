"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/shared/form-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { useMe, useUpdateMeMutation } from "@/features/account/api";
import { updateProfileFormSchema, UpdateProfileFormValues } from "@/features/account/schemas";

export const ProfileForm = () => {
    const { data: me, isLoading } = useMe();
    const updateMe = useUpdateMeMutation();

    const { control, handleSubmit, reset, formState } = useForm<UpdateProfileFormValues>({
        resolver: zodResolver(updateProfileFormSchema),
        defaultValues: { name: "", username: "", phone: "" },
    });

    useEffect(() => {
        if (!me) return;
        reset({ name: me.name ?? "", username: me.username, phone: me.phone ?? "" });
    }, [me, reset]);

    const onSubmit = handleSubmit(async (values) => {
        const payload: Record<string, unknown> = {};
        if (values.name && values.name !== me?.name) payload.name = values.name;
        if (values.username && values.username !== me?.username) payload.username = values.username;
        if (values.phone && values.phone !== me?.phone) payload.phone = values.phone;

        if (Object.keys(payload).length === 0) return;

        try {
            await updateMe.mutateAsync(payload);
            toast.add({ title: "Profile updated" });
        } catch (error) {
            toast.add({
                title: "Update failed",
                description: error instanceof ApiError ? error.message : "Something went wrong",
                type: "error",
            });
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
                <FormInput control={control} name="name" label="Name" placeholder="Full name" />
                <FormInput control={control} name="username" label="Username" placeholder="username" />
                <FormInput control={control} name="phone" label="Phone" placeholder="+1 555 000 0000" />
                <LoadingButton type="submit" isLoading={formState.isSubmitting} className="self-start">
                    Save changes
                </LoadingButton>
            </FieldGroup>
        </form>
    );
};
