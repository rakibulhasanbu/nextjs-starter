"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/shared/form-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { registerAction } from "@/features/auth/actions";
import { signUpFormSchema, SignUpFormValues } from "@/features/auth/schemas";
import { setTokens, setUser } from "@/features/auth/slice";
import { useAppDispatch } from "@/redux/hook";

export const SignUpForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    const result = await registerAction({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    setIsSubmitting(false);

    if (result.status === "error") {
      toast.add({ title: "Sign up failed", description: result.error, type: "error" });
      return;
    }

    if (result.data.accessToken && result.data.refreshToken) {
      dispatch(
        setTokens({ accessToken: result.data.accessToken, refreshToken: result.data.refreshToken })
      );
    }
    if (result.data.user) {
      dispatch(setUser(result.data.user));
    }

    toast.add({ title: "Account created", description: "Let's verify your email address.", type: "success" });
    router.replace("/auth/verify-email");
    router.refresh();
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
        <FormInput
          control={control}
          name="password"
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
        />
        <FormInput
          control={control}
          name="confirmPassword"
          type="password"
          label="Confirm password"
          placeholder="Re-enter your password"
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
