"use client";

import { useEffect, useState } from "react";

import { MailIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";
import { resendVerificationAction } from "@/features/auth/actions";

const RESEND_COOLDOWN_SECONDS = 60;

type CheckEmailPanelProps = {
  email?: string;
};

/** Shown right after registration — the account is PENDING_VERIFICATION until the emailed link is clicked. */
export const CheckEmailPanel = ({ email }: CheckEmailPanelProps) => {
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onResend = async () => {
    if (!email || cooldown > 0) return;

    setIsResending(true);
    const result = await resendVerificationAction(email);
    setIsResending(false);

    if (result.status === "error") {
      toast.add({ title: "Couldn't resend the link", description: result.error, type: "error" });
      return;
    }

    toast.add({ title: "Verification email resent", type: "success" });
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <div className="flex flex-col gap-6">
      <Empty className="border-none p-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MailIcon />
          </EmptyMedia>
          <EmptyTitle>Check your email</EmptyTitle>
          <EmptyDescription>
            {email ? (
              <>
                We sent a verification link to <span className="font-medium text-foreground">{email}</span>. Click
                it to activate your account.
              </>
            ) : (
              "We sent you a verification link. Click it to activate your account."
            )}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
      <Button type="button" variant="outline" className="w-full" disabled={!email || isResending || cooldown > 0} onClick={onResend}>
        {cooldown > 0 ? `Resend link (${cooldown}s)` : "Resend link"}
      </Button>
    </div>
  );
};
