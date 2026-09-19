import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>
          <Text variant="h3" render={<h1 />}>
            Verify your email
          </Text>
        </CardTitle>
        <CardDescription>One more step before you can access your account</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <VerifyEmailForm />
      </CardContent>
    </Card>
  );
}
