import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LinkButton } from "@/components/shared/link-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/auth/reset-password">) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : undefined;

  if (!email) {
    redirect("/auth/forgot-password");
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>
          <Text variant="h3" render={<h1 />}>
            Reset your password
          </Text>
        </CardTitle>
        <CardDescription>Enter the code we sent to {email} and choose a new password</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <ResetPasswordForm email={email} />
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
