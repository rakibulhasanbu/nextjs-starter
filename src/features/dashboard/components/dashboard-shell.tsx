"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOutIcon } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { dashboardNavItems } from "@/features/dashboard/nav-config";
import { useAuthStore } from "@/store/auth-store";

export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const logoutWithReload = useAuthStore((state) => state.logoutWithReload);

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader className="px-3 py-3">
                    <Logo size="sm" />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {dashboardNavItems.map((item) => {
                                    const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
                                    const Icon = item.icon;
                                    return (
                                        <SidebarMenuItem key={item.url}>
                                            <SidebarMenuButton isActive={isActive} render={<Link href={item.url} />}>
                                                {Icon && <Icon />}
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="gap-2 px-3 py-3">
                    {user && (
                        <div className="flex flex-col overflow-hidden">
                            <Text variant="small" weight="medium" className="truncate">
                                {user.name || user.username}
                            </Text>
                            <Text variant="small" tone="muted" className="truncate">
                                {user.email}
                            </Text>
                        </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => logoutWithReload()}>
                        <LogOutIcon data-icon="inline-start" />
                        Sign out
                    </Button>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex items-center gap-2 border-b px-4 py-3">
                    <SidebarTrigger />
                </header>
                <div className="content-width flex flex-1 flex-col gap-6 p-4 sm:p-6">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
};
