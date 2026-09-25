import type { Metadata } from "next";

import { ReactivateAccountForm } from "@/features/auth/components/reactivate-account-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { LinkButton } from "@/components/shared/link-button";

export const metadata: Metadata = { title: "Reactivate your account" };

export default async function ReactivateAccountPage({ searchParams }: PageProps<"/auth/reactivate-account">) {
    const params = await searchParams;
    const email = typeof params.email === "string" ? params.email : undefined;
    const deadline = formatDeadline(typeof params.graceEndsAt === "string" ? params.graceEndsAt : undefined);

    return (
        <Card className="shadow-card">
            <CardHeader>
                <CardTitle>
                    <Text variant="h3" render={<h1 />}>
                        Reactivate your account
                    </Text>
                </CardTitle>
                <CardDescription>
                    This account is scheduled for deletion. Enter the code we emailed you to undo it —{" "}
                    {deadline
                        ? `after ${deadline} the account is gone for good.`
                        : "once the grace period ends, the account is gone for good."}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <ReactivateAccountForm email={email} />
                <Text variant="small" tone="muted" align="center">
                    Changed your mind?{" "}
                    <LinkButton href="/auth/sign-in" variant="link" className="h-auto p-0 align-baseline">
                        Back to sign in
                    </LinkButton>
                </Text>
            </CardContent>
        </Card>
    );
}

/**
 * The backend puts the end of the grace period on the 409 that routes here, and
 * the sign-in/sign-up forms forward it as a query param. It is decoration on a
 * page that works without it, so anything unparseable falls back to the vague
 * wording rather than rendering "Invalid Date".
 */
function formatDeadline(graceEndsAt: string | undefined): string | null {
    if (!graceEndsAt) return null;
    const date = new Date(graceEndsAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
