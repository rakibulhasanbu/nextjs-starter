import { redirect } from "next/navigation";

import { getUserCookie } from "@/lib/auth-cookies";
import { UserRole } from "@/features/auth/types";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getUserCookie();

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
        redirect("/");
    }

    return <DashboardShell>{children}</DashboardShell>;
}
