"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/shared/form-input";
import { FormPhoneInput } from "@/components/shared/form-phone-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { registerAction } from "@/features/auth/actions";
import { signUpFormSchema, SignUpFormValues } from "@/features/auth/schemas";

export const SignUpForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    const result = await registerAction({
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
    });
    setIsSubmitting(false);

    if (result.status === "error") {
      toast.add({ title: "Sign up failed", description: result.error, type: "error" });
      return;
    }

    // Registration doesn't log the user in — the account stays pending until
    // they click the verification link we just emailed them.
    router.replace(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormInput
          control={control}
          name="name"
          type="text"
          label="Name"
          placeholder="Jane Doe"
          autoComplete="name"
          required
        />
        <FormInput
          control={control}
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <FormPhoneInput
          control={control}
          name="phone"
          label="Phone number"
          placeholder="Enter phone number"
          autoComplete="tel"
          required
        />
        <FormInput
          control={control}
          name="password"
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
        />
        <LoadingButton type="submit" className="w-full" isLoading={isSubmitting}>
          Create account
        </LoadingButton>
      </FieldGroup>
    </form>
  );
};
