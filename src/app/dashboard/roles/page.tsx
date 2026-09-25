import type { Metadata } from "next";

import { RolesList } from "@/features/roles/components/roles-list";

export const metadata: Metadata = { title: "Roles" };

export default function DashboardRolesPage() {
    return <RolesList />;
}
