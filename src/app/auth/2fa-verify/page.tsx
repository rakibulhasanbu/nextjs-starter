import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { TwoFactorVerifyForm } from "@/features/auth/components/two-factor-verify-form";

export const metadata: Metadata = { title: "Two-factor verification" };

export default async function TwoFactorVerifyPage({
  searchParams,
}: PageProps<"/auth/2fa-verify">) {
  const params = await searchParams;
  const twoFactorToken = typeof params.twoFactorToken === "string" ? params.twoFactorToken : undefined;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : undefined;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>
          <Text variant="h3" render={<h1 />}>
            Two-factor verification
          </Text>
        </CardTitle>
        <CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
      </CardHeader>
      <CardContent>
        <TwoFactorVerifyForm twoFactorToken={twoFactorToken} callbackUrl={callbackUrl} />
      </CardContent>
    </Card>
  );
}
