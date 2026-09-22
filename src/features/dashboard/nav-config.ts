import { LayoutDashboardIcon, UsersIcon } from "lucide-react";

import { NavItem } from "@/features/auth/types";

export const dashboardNavItems: NavItem[] = [
    { title: "Overview", url: "/dashboard/overview", icon: LayoutDashboardIcon },
    { title: "Users", url: "/dashboard/users", icon: UsersIcon },
];
