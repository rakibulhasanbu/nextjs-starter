"use client";

import { useState } from "react";

import { ArrowRight, LogOutIcon } from "lucide-react";

import { LinkButton } from "@/components/shared/link-button";
import { LoadingButton } from "@/components/shared/loading-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/features/auth/store";

const initials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

export const HomeAuthActions = () => {
    const user = useAuthStore((state) => state.user);
    const logoutWithReload = useAuthStore((state) => state.logoutWithReload);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    if (user) {
        const displayName = user.name || user.username;

        return (
            <div className="mt-2 flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback>{initials(displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                        <Text variant="small" weight="medium">
                            {displayName}
                        </Text>
                        <Text variant="small" tone="muted">
                            {user.email}
                        </Text>
                    </div>
                </div>

                <LoadingButton
                    variant="outline"
                    size="lg"
                    isLoading={isLoggingOut}
                    onClick={async () => {
                        setIsLoggingOut(true);
                        await logoutWithReload();
                    }}
                >
                    <LogOutIcon data-icon="inline-start" />
                    Sign out
                </LoadingButton>
            </div>
        );
    }

    return (
        <div className="mt-2 flex items-center gap-3">
            <LinkButton href="/auth/sign-up" variant="default" size="lg">
                Get started
                <ArrowRight />
            </LinkButton>
            <LinkButton href="/auth/sign-in" variant="outline" size="lg">
                Sign in
            </LinkButton>
        </div>
    );
};
