import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { CheckEmailPanel } from "@/features/auth/components/check-email-panel";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyEmailPendingPage({
  searchParams,
}: PageProps<"/auth/verify-email">) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : undefined;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>
          <Text variant="h3" render={<h1 />}>
            Almost there
          </Text>
        </CardTitle>
        <CardDescription>One more step before you can sign in</CardDescription>
      </CardHeader>
      <CardContent>
        <CheckEmailPanel email={email} />
      </CardContent>
    </Card>
  );
}
