"use client";

import { useMemo } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { PermissionKey } from "@/features/auth/types";
import { usePermissionCatalog } from "@/features/roles/api";
import { PermissionDefinition } from "@/features/roles/types";

type PermissionPickerProps = {
    /** What the actor holds. The backend refuses to grant anything outside this, so the rest is shown disabled. */
    grantablePermissions: PermissionKey[];
    value: string[];
    onChange: (next: string[]) => void;
};

export const PermissionPicker = ({ grantablePermissions, value, onChange }: PermissionPickerProps) => {
    const { data: catalog, isLoading } = usePermissionCatalog();

    const groups = useMemo(() => groupByResource(catalog ?? []), [catalog]);

    if (isLoading) return <Skeleton className="h-64 w-full" />;

    const toggle = (key: string, checked: boolean) =>
        onChange(checked ? [...value, key] : value.filter((existing) => existing !== key));

    return (
        <Field>
            <FieldLabel>Permissions</FieldLabel>
            <div className="flex flex-col gap-4 rounded-md border p-3">
                {groups.map(([resource, permissions]) => (
                    <div key={resource} className="flex flex-col gap-2">
                        <Text variant="small" weight="medium" className="capitalize">
                            {resource}
                        </Text>
                        {permissions.map((permission) => {
                            const grantable = grantablePermissions.includes(permission.key);
                            return (
                                <label
                                    key={permission.key}
                                    className="flex items-start gap-2 data-disabled:opacity-50"
                                    data-disabled={!grantable || undefined}
                                >
                                    <Checkbox
                                        checked={value.includes(permission.key)}
                                        disabled={!grantable}
                                        onCheckedChange={(checked) => toggle(permission.key, checked === true)}
                                    />
                                    <span className="flex flex-col">
                                        <Text variant="small">{permission.description}</Text>
                                        <Text variant="small" tone="muted" className="font-mono text-xs">
                                            {permission.key}
                                        </Text>
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                ))}
            </div>
            <Text variant="small" tone="muted">
                Greyed-out permissions are ones you don&apos;t hold yourself — the server refuses to grant those.
            </Text>
        </Field>
    );
};

const groupByResource = (catalog: PermissionDefinition[]) => {
    const byResource = new Map<string, PermissionDefinition[]>();
    for (const permission of catalog) {
        const existing = byResource.get(permission.resource);
        if (existing) existing.push(permission);
        else byResource.set(permission.resource, [permission]);
    }
    return [...byResource.entries()];
};
