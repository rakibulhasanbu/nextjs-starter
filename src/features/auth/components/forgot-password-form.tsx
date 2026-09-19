"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/shared/form-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { forgotPasswordAction } from "@/features/auth/actions";
import { forgotFormSchema, ForgotFormValues } from "@/features/auth/schemas";

export const ForgotPasswordForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotFormSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    const result = await forgotPasswordAction(values.email);
    setIsSubmitting(false);

    if (result.status === "error") {
      toast.add({ title: "Couldn't send reset code", description: result.error, type: "error" });
      return;
    }

    toast.add({
      title: "Reset code sent",
      description: "Check your email for the 6-digit code.",
      type: "success",
    });
    router.push(`/auth/reset-password?email=${encodeURIComponent(values.email)}`);
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
        <LoadingButton type="submit" className="w-full" isLoading={isSubmitting}>
          Send reset code
        </LoadingButton>
      </FieldGroup>
    </form>
  );
};
