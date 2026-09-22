import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { LinkButton } from "@/components/shared/link-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/features/account/components/profile-form";

export const metadata: Metadata = { title: "Profile" };

export default function AccountPage() {
    return (
        <div className="content-width flex flex-1 flex-col gap-6 p-4 sm:p-6">
            <PageHeader
                title="Profile"
                description="Manage your personal details."
                actions={
                    <LinkButton href="/account/settings" variant="outline">
                        Settings
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
        </div>
    );
}
