import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { LinkButton } from "@/components/shared/link-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

// Root-level — matches the backend's emailed link exactly: `${APP_URL}/reset-password?token=...`.
export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
    const params = await searchParams;
    const token = typeof params.token === "string" ? params.token : undefined;

    if (!token) {
        redirect("/auth/forgot-password");
    }

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 sm:px-6">
            <Logo size="lg" />
            <div className="w-full max-w-sm sm:max-w-md">
                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle>
                            <Text variant="h3" render={<h1 />}>
                                Reset your password
                            </Text>
                        </CardTitle>
                        <CardDescription>Choose a new password for your account</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <ResetPasswordForm token={token} />
                        <Text variant="small" tone="muted" align="center">
                            Remembered your password?{" "}
                            <LinkButton href="/auth/sign-in" variant="link" className="h-auto p-0 align-baseline">
                                Sign in
                            </LinkButton>
                        </Text>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
