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
import { resetPasswordAction } from "@/features/auth/actions";
import { resetPasswordFormSchema, ResetPasswordFormValues } from "@/features/auth/schemas";

interface ResetPasswordFormProps {
  email: string;
}

export const ResetPasswordForm = ({ email }: ResetPasswordFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    const result = await resetPasswordAction({
      email,
      otp: values.otp,
      newPassword: values.newPassword,
    });
    setIsSubmitting(false);

    if (result.status === "error") {
      toast.add({ title: "Couldn't reset password", description: result.error, type: "error" });
      return;
    }

    toast.add({
      title: "Password reset",
      description: "Sign in with your new password.",
      type: "success",
    });
    router.replace("/auth/sign-in");
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormOTPInput
          control={control}
          name="otp"
          label="Verification code"
          description="Enter the 6-digit code we emailed you."
          length={6}
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
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          required
        />
        <LoadingButton type="submit" className="w-full" isLoading={isSubmitting}>
          Reset password
        </LoadingButton>
      </FieldGroup>
    </form>
  );
};
