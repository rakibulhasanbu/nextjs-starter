"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/shared/form-input";
import { FormOTPInput } from "@/components/shared/form-OTP-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { reactivateAccountAction } from "@/features/auth/actions";
import { reactivateAccountFormSchema, ReactivateAccountFormValues } from "@/features/auth/schemas";

type ReactivateAccountFormProps = {
  email?: string;
};

export const ReactivateAccountForm = ({ email }: ReactivateAccountFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<ReactivateAccountFormValues>({
    resolver: zodResolver(reactivateAccountFormSchema),
    defaultValues: { email: email ?? "", code: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    const result = await reactivateAccountAction(values.email, values.code);
    setIsSubmitting(false);

    if (result.status === "error") {
      toast.add({ title: "Reactivation failed", description: result.error, type: "error" });
      return;
    }

    // Reactivation only restores the account — it issues no session, so the
    // user still has to sign in (and will hit 2FA if they had it enabled).
    toast.add({ title: "Account restored", description: "You can sign in again now." });
    router.replace(`/auth/sign-in?email=${encodeURIComponent(values.email)}`);
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormInput
          control={control}
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <FormOTPInput
          control={control}
          name="code"
          label="Reactivation code"
          description="Enter the 6-digit code we emailed you."
          length={6}
          pattern="^\d*$"
        />
        <LoadingButton type="submit" isLoading={isSubmitting}>
          Reactivate account
        </LoadingButton>
      </FieldGroup>
    </form>
  );
};
