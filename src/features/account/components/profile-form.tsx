"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/shared/form-input";
import { FormSelect } from "@/components/shared/form-select";
import { LoadingButton } from "@/components/shared/loading-button";
import { FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { useMe, useUpdateMeMutation } from "@/features/account/api";
import { updateProfileFormSchema, UpdateProfileFormValues } from "@/features/account/schemas";
import { UpdateMePayload } from "@/features/account/types";
import { Gender } from "@/features/auth/types";

const GENDER_OPTIONS = [
    { value: Gender.MALE, label: "Male" },
    { value: Gender.FEMALE, label: "Female" },
    { value: Gender.OTHER, label: "Other" },
    { value: Gender.PREFER_NOT_TO_SAY, label: "Prefer not to say" },
];

export const ProfileForm = () => {
    const { data: me, isLoading } = useMe();
    const updateMe = useUpdateMeMutation();

    const { control, handleSubmit, reset, formState } = useForm<UpdateProfileFormValues>({
        resolver: zodResolver(updateProfileFormSchema),
        defaultValues: { name: "", username: "", phone: "", dateOfBirth: "", gender: "" },
    });

    useEffect(() => {
        if (!me) return;
        reset({
            name: me.name ?? "",
            username: me.username,
            phone: me.phone ?? "",
            dateOfBirth: me.profile?.dateOfBirth ?? "",
            gender: me.profile?.gender ?? "",
        });
    }, [me, reset]);

    const onSubmit = handleSubmit(async (values) => {
        const payload: UpdateMePayload = {};
        if (values.name && values.name !== me?.name) payload.name = values.name;
        if (values.username && values.username !== me?.username) payload.username = values.username;
        if (values.phone && values.phone !== me?.phone) payload.phone = values.phone;

        // `dateOfBirth` and `gender` live on the nested `user_profiles` record —
        // sending them at the top level is rejected by the backend's strictObject.
        const profile: NonNullable<UpdateMePayload["profile"]> = {};
        if (values.dateOfBirth && values.dateOfBirth !== (me?.profile?.dateOfBirth ?? ""))
            profile.dateOfBirth = values.dateOfBirth;
        if (values.gender && values.gender !== me?.profile?.gender) profile.gender = values.gender;
        if (Object.keys(profile).length > 0) payload.profile = profile;

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
                <FormInput control={control} name="dateOfBirth" type="date" label="Date of birth" placeholder="" />
                <FormSelect control={control} name="gender" label="Gender" options={GENDER_OPTIONS} />
                <LoadingButton type="submit" isLoading={formState.isSubmitting} className="self-start">
                    Save changes
                </LoadingButton>
            </FieldGroup>
        </form>
    );
};
