import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { LinkButton } from "@/components/shared/link-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/features/account/components/profile-form";
import { ChangePasswordForm } from "@/features/account/components/change-password-form";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
    return (
        <div className="content-width flex flex-1 flex-col gap-6 p-4 sm:p-6">
            <PageHeader
                title="Account"
                description="Manage your profile and security settings."
                actions={
                    <LinkButton href="/account/sessions" variant="outline">
                        Sessions
                    </LinkButton>
                }
            />
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm />
                </CardContent>
            </Card>
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your account password.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChangePasswordForm />
                </CardContent>
            </Card>
        </div>
    );
}
