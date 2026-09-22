import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { OverviewStats } from "@/features/dashboard/components/overview-stats";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardOverviewPage() {
    return (
        <>
            <PageHeader title="Overview" description="A snapshot of your users." />
            <OverviewStats />
        </>
    );
}
