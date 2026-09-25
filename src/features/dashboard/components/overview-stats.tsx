"use client";

import { ShieldCheckIcon, UserCheckIcon, UserIcon, UserXIcon } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUsersCount } from "@/features/dashboard/api";
import { UserStatus } from "@/features/dashboard/types";
import { ROLE_IDS } from "@/features/auth/types";

type StatCardProps = {
    label: string;
    value: number | undefined;
    isLoading: boolean;
    icon: React.ReactNode;
};

const StatCard = ({ label, value, isLoading, icon }: StatCardProps) => (
    <Card className="shadow-card transition-colors hover:border-brand/30">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <div className="flex flex-col gap-1">
                <Text variant="small" tone="muted">
                    {label}
                </Text>
                {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                ) : (
                    <CardTitle className="text-2xl">{value ?? 0}</CardTitle>
                )}
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand [&_svg]:size-4.5">
                {icon}
            </div>
        </CardHeader>
    </Card>
);

/** No stats/analytics endpoint exists yet — counts are derived cheaply from `.total` on 1-row admin/users pages. */
export const OverviewStats = () => {
    const total = useAdminUsersCount();
    const active = useAdminUsersCount({ status: UserStatus.ACTIVE });
    const pending = useAdminUsersCount({ status: UserStatus.PENDING_VERIFICATION });
    const suspended = useAdminUsersCount({ status: UserStatus.SUSPENDED });
    const admins = useAdminUsersCount({ roleId: ROLE_IDS.ADMIN });

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total users" value={total.data?.meta?.total} isLoading={total.isLoading} icon={<UserIcon />} />
            <StatCard
                label="Active"
                value={active.data?.meta?.total}
                isLoading={active.isLoading}
                icon={<UserCheckIcon />}
            />
            <StatCard
                label="Pending verification"
                value={pending.data?.meta?.total}
                isLoading={pending.isLoading}
                icon={<UserXIcon />}
            />
            <StatCard
                label="Suspended"
                value={suspended.data?.meta?.total}
                isLoading={suspended.isLoading}
                icon={<UserXIcon />}
            />
            <StatCard
                label="Admins"
                value={admins.data?.meta?.total}
                isLoading={admins.isLoading}
                icon={<ShieldCheckIcon />}
            />
        </div>
    );
};
