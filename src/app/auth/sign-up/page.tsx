import type { Metadata } from "next";

import { LinkButton } from "@/components/shared/link-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>
          <Text variant="h3" render={<h1 />}>
            Create your account
          </Text>
        </CardTitle>
        <CardDescription>Start by filling out the details below</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <SignUpForm />
        <Text variant="small" tone="muted" align="center">
          Already have an account?{" "}
          <LinkButton href="/auth/sign-in" variant="link" className="h-auto p-0 align-baseline">
            Sign in
          </LinkButton>
        </Text>
      </CardContent>
    </Card>
  );
}
