import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { SessionsList } from "@/features/account/components/sessions-list";

export const metadata: Metadata = { title: "Sessions" };

export default function AccountSessionsPage() {
    return (
        <>
            <PageHeader title="Sessions" description="Devices currently signed in to your account." />
            <SessionsList />
        </>
    );
}
