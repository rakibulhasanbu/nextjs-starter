import { LayoutDashboardIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";

import { NavItem } from "@/features/auth/types";

export const dashboardNavItems: NavItem[] = [
    { title: "Overview", url: "/dashboard/overview", icon: LayoutDashboardIcon },
    { title: "Users", url: "/dashboard/users", icon: UsersIcon },
    { title: "Roles", url: "/dashboard/roles", icon: ShieldCheckIcon },
];
