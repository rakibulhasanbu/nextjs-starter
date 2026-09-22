import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { UsersTable } from "@/features/dashboard/components/users-table";

export const metadata: Metadata = { title: "Users" };

export default function DashboardUsersPage() {
    return (
        <>
            <PageHeader title="Users" description="Manage user accounts, roles and access." />
            <UsersTable />
        </>
    );
}
