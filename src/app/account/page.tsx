import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/features/account/components/profile-form";

export const metadata: Metadata = { title: "Profile" };

export default function AccountPage() {
    return (
        <>
            <PageHeader title="Profile" description="Manage your personal details." />
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm />
                </CardContent>
            </Card>
        </>
    );
}
