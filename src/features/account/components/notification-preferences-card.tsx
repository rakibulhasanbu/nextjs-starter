"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { useNotificationPreferences, useUpdateNotificationPreferencesMutation } from "@/features/account/api";
import { NotificationPreferences } from "@/features/account/types";
import { ApiError } from "@/lib/api-client";

const CHANNELS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
    {
        key: "loginEmailNotification",
        label: "New sign-in alerts",
        description: "Get an email whenever your account is signed into from a new device.",
    },
    {
        key: "transactionsEmailNotification",
        label: "Transaction emails",
        description: "Receive an email for account activity such as password or security changes.",
    },
    {
        key: "transactionsPushNotification",
        label: "Transaction push notifications",
        description: "Receive a push notification for account activity on your devices.",
    },
];

export const NotificationPreferencesCard = () => {
    const { data: preferences, isLoading } = useNotificationPreferences();
    const updatePreferences = useUpdateNotificationPreferencesMutation();

    const handleToggle = (key: keyof NotificationPreferences, checked: boolean) => {
        updatePreferences.mutate(
            { [key]: checked },
            {
                onError: (error) => {
                    toast.add({
                        title: "Couldn't update notification preference",
                        description: error instanceof ApiError ? error.message : "Something went wrong",
                        type: "error",
                    });
                },
            },
        );
    };

    return (
        <Card className="shadow-card">
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose which emails and push notifications you receive.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {isLoading || !preferences ? (
                    <>
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </>
                ) : (
                    CHANNELS.map(({ key, label, description }) => (
                        <Field key={key} orientation="horizontal">
                            <FieldContent>
                                <FieldLabel htmlFor={key}>{label}</FieldLabel>
                                <FieldDescription>{description}</FieldDescription>
                            </FieldContent>
                            <Switch
                                id={key}
                                checked={preferences[key]}
                                onCheckedChange={(checked) => handleToggle(key, checked)}
                                disabled={updatePreferences.isPending}
                            />
                        </Field>
                    ))
                )}
            </CardContent>
        </Card>
    );
};
