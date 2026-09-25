import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { LinkButton } from "@/components/shared/link-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/features/account/components/change-password-form";
import { DeleteAccountCard } from "@/features/account/components/delete-account-card";
import { NotificationPreferencesCard } from "@/features/account/components/notification-preferences-card";
import { TwoFactorAuthCard } from "@/features/two-factor/components/two-factor-auth-card";
import { PasskeysCard } from "@/features/passkeys/components/passkeys-card";

export const metadata: Metadata = { title: "Settings" };

export default function AccountSettingsPage() {
    return (
        <>
            <PageHeader title="Settings" description="Manage your password, sessions, and account security." />
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Manage the password used to sign in to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChangePasswordForm />
                </CardContent>
            </Card>
            <PasskeysCard />
            <TwoFactorAuthCard />
            <NotificationPreferencesCard />
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle>Sessions</CardTitle>
                    <CardDescription>Review and sign out devices currently signed in to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LinkButton href="/account/sessions" variant="outline">
                        Manage sessions
                    </LinkButton>
                </CardContent>
            </Card>
            <Card className="border-destructive/30 shadow-card">
                <CardHeader>
                    <CardTitle>Danger zone</CardTitle>
                    <CardDescription>Permanently delete your account and all associated data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DeleteAccountCard />
                </CardContent>
            </Card>
        </>
    );
}
