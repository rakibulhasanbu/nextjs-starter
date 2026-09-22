import type { Metadata } from "next";

import { Logo } from "@/components/shared/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { VerifyEmailStatus } from "@/features/auth/components/verify-email-status";

export const metadata: Metadata = { title: "Verify email" };

// Root-level — matches the backend's emailed link exactly: `${APP_URL}/verify-email?token=...`.
export default function VerifyEmailPage() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 sm:px-6">
            <Logo size="lg" />
            <div className="w-full max-w-sm sm:max-w-md">
                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle>
                            <Text variant="h3" render={<h1 />}>
                                Email verification
                            </Text>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <VerifyEmailStatus />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
