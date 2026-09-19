import type { Metadata } from "next";

import { LinkButton } from "@/components/shared/link-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>
          <Text variant="h3" render={<h1 />}>
            Forgot your password?
          </Text>
        </CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a reset code</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <ForgotPasswordForm />
        <Text variant="small" tone="muted" align="center">
          Remembered your password?{" "}
          <LinkButton href="/auth/sign-in" variant="link" className="h-auto p-0 align-baseline">
            Sign in
          </LinkButton>
        </Text>
      </CardContent>
    </Card>
  );
}
