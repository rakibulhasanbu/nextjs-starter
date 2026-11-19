"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { login2faVerifyAction } from "@/features/auth/actions";
import {
  twoFactorRecoveryFormSchema,
  TwoFactorRecoveryFormValues,
  twoFactorVerifyFormSchema,
  TwoFactorVerifyFormValues,
} from "@/features/auth/schemas";
import { useAuthStore } from "@/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { FormInput } from "@/components/shared/form-input";
import { FormOTPInput } from "@/components/shared/form-otp-input";
import { LoadingButton } from "@/components/shared/loading-button";

type TwoFactorVerifyFormProps = {
  twoFactorToken?: string;
  callbackUrl?: string;
};

/** Second step of sign-in for accounts with 2FA enabled — consumes a TOTP code or a one-time recovery code. */
export const TwoFactorVerifyForm = ({ twoFactorToken, callbackUrl }: TwoFactorVerifyFormProps) => {
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const codeForm = useForm<TwoFactorVerifyFormValues>({
    resolver: zodResolver(twoFactorVerifyFormSchema),
    defaultValues: { code: "" },
  });

  const recoveryForm = useForm<TwoFactorRecoveryFormValues>({
    resolver: zodResolver(twoFactorRecoveryFormSchema),
    defaultValues: { recoveryCode: "" },
  });

  const resolvedCallbackUrl = callbackUrl || searchParams.get("callbackUrl") || "/";

  const handleSuccess = (result: Awaited<ReturnType<typeof login2faVerifyAction>>) => {
    if (result.status === "error") {
      toast.add({ title: "Verification failed", description: result.error, type: "error" });
      return;
    }

    setTokens({ accessToken: result.data.accessToken, refreshToken: result.data.refreshToken });
    setUser(result.data.user);

    router.replace(resolvedCallbackUrl);
    router.refresh();
  };

  const onSubmitCode = codeForm.handleSubmit(async (values) => {
    if (!twoFactorToken) return;
    setIsSubmitting(true);
    const result = await login2faVerifyAction({ twoFactorToken, code: values.code });
    setIsSubmitting(false);
    handleSuccess(result);
  });

  const onSubmitRecovery = recoveryForm.handleSubmit(async (values) => {
    if (!twoFactorToken) return;
    setIsSubmitting(true);
    const result = await login2faVerifyAction({ twoFactorToken, recoveryCode: values.recoveryCode });
    setIsSubmitting(false);
    handleSuccess(result);
  });

  if (!twoFactorToken) {
    return (
      <FieldGroup>
        <Text variant="small" tone="muted" render={<p />} className="leading-normal font-normal">
          This verification link is invalid or has expired. Please sign in again.
        </Text>
      </FieldGroup>
    );
  }

  if (useRecoveryCode) {
    return (
      <form onSubmit={onSubmitRecovery} noValidate>
        <FieldGroup>
          <FormInput
            control={recoveryForm.control}
            name="recoveryCode"
            type="text"
            label="Recovery code"
            placeholder="Enter one of your recovery codes"
            autoComplete="one-time-code"
            required
          />
          <LoadingButton type="submit" className="w-full" isLoading={isSubmitting}>
            Verify
          </LoadingButton>
          <Button
            type="button"
            variant="link"
            className="h-auto self-start p-0"
            onClick={() => setUseRecoveryCode(false)}
          >
            Use an authenticator code instead
          </Button>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmitCode} noValidate>
      <FieldGroup>
        <FormOTPInput control={codeForm.control} name="code" length={6} pattern="\d*" />
        <LoadingButton type="submit" className="w-full" isLoading={isSubmitting}>
          Verify
        </LoadingButton>
        <Button type="button" variant="link" className="h-auto self-start p-0" onClick={() => setUseRecoveryCode(true)}>
          Use a recovery code instead
        </Button>
      </FieldGroup>
    </form>
  );
};
