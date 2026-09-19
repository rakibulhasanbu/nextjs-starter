"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormOTPInput } from "@/components/shared/form-OTP-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { resendVerificationOtpAction, verifyEmailAction } from "@/features/auth/actions";
import { otpFormSchema, OtpFormValues } from "@/features/auth/schemas";
import { setUser } from "@/features/auth/slice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";

const RESEND_COOLDOWN_SECONDS = 60;

export const VerifyEmailForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { control, handleSubmit } = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = handleSubmit(async (values) => {
    if (!user?.email) return;

    setIsSubmitting(true);
    const result = await verifyEmailAction(user.email, Number(values.otp));
    setIsSubmitting(false);

    if (result.status === "error") {
      toast.add({ title: "Verification failed", description: result.error, type: "error" });
      return;
    }

    dispatch(setUser({ ...user, isVerified: true }));
    toast.add({ title: "Email verified", type: "success" });
    router.replace("/");
    router.refresh();
  });

  const onResend = async () => {
    if (!user?.email || cooldown > 0) return;

    setIsResending(true);
    const result = await resendVerificationOtpAction(user.email);
    setIsResending(false);

    if (result.status === "error") {
      toast.add({ title: "Couldn't resend code", description: result.error, type: "error" });
      return;
    }

    toast.add({ title: "Code resent", description: "Check your email for the new code.", type: "success" });
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        {user?.email && (
          <FieldDescription>
            We sent a 6-digit code to <span className="font-medium text-foreground">{user.email}</span>.
          </FieldDescription>
        )}
        <FormOTPInput control={control} name="otp" label="Verification code" length={6} />
        <LoadingButton type="submit" className="w-full" isLoading={isSubmitting}>
          Verify email
        </LoadingButton>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={isResending || cooldown > 0}
          onClick={onResend}
        >
          {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
        </Button>
      </FieldGroup>
    </form>
  );
};
