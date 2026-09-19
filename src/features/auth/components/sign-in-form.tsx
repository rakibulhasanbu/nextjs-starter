"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/shared/form-input";
import { LinkButton } from "@/components/shared/link-button";
import { LoadingButton } from "@/components/shared/loading-button";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { loginAction } from "@/features/auth/actions";
import { signInFormSchema, SignInFormValues } from "@/features/auth/schemas";
import { setTokens, setUser } from "@/features/auth/slice";
import { useAppDispatch } from "@/redux/hook";

export const SignInForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    const result = await loginAction(values.email, values.password);
    setIsSubmitting(false);

    if (result.status === "error") {
      toast.add({ title: "Sign in failed", description: result.error, type: "error" });
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

    const callbackUrl = searchParams.get("callbackUrl") || "/";
    router.replace(result.data.user?.isVerified === false ? "/auth/verify-email" : callbackUrl);
    router.refresh();
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
        <div className="flex flex-col gap-2">
          <FormInput
            control={control}
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
          <LinkButton
            href="/auth/forgot-password"
            variant="link"
            size="sm"
            className="h-auto self-end p-0"
          >
            Forgot password?
          </LinkButton>
        </div>
        <LoadingButton type="submit" className="w-full" isLoading={isSubmitting}>
          Sign in
        </LoadingButton>
      </FieldGroup>
    </form>
  );
};
