"use client";

import { useState } from "react";

import { MailIcon } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/shared/form-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { FieldGroup } from "@/components/ui/field";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";
import { forgotPasswordAction } from "@/features/auth/actions";
import { forgotFormSchema, ForgotFormValues } from "@/features/auth/schemas";

export const ForgotPasswordForm = () => {
  const [sentTo, setSentTo] = useState<string | null>(null);
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
      toast.add({ title: "Couldn't send reset link", description: result.error, type: "error" });
      return;
    }

    setSentTo(values.email);
  });

  if (sentTo) {
    return (
      <Empty className="border-none p-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MailIcon />
          </EmptyMedia>
          <EmptyTitle>Check your email</EmptyTitle>
          <EmptyDescription>
            If an account exists for <span className="font-medium text-foreground">{sentTo}</span>, we&apos;ve sent
            a link to reset your password.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

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
          Send reset link
        </LoadingButton>
      </FieldGroup>
    </form>
  );
};
