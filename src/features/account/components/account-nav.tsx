"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
    { href: "/account", label: "Profile" },
    { href: "/account/settings", label: "Settings" },
    { href: "/account/sessions", label: "Sessions" },
];

export const AccountNav = () => {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-card">
            {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                            isActive
                                ? "bg-brand text-brand-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
};
