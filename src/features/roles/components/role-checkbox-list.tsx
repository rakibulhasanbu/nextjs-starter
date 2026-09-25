"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useMe } from "@/features/account/api";
import { ROLE_IDS } from "@/features/auth/types";
import { useRoles } from "@/features/roles/api";

type RoleCheckboxListProps = {
    label?: string;
    /** Elevated roles only — the baseline `user` role is added by the backend on every assignment. */
    value: string[];
    onChange: (next: string[]) => void;
};

/**
 * The assignable set is derived from the live roles list rather than hardcoded,
 * so roles created at runtime show up here. The backend refuses any role ranked
 * at or above the actor's own, so those are filtered out up front.
 */
export const RoleCheckboxList = ({ label = "Roles", value, onChange }: RoleCheckboxListProps) => {
    const { data: me } = useMe();
    const { data: roles, isLoading } = useRoles();

    if (isLoading) return <Skeleton className="h-24 w-full" />;

    const assignable = (roles ?? []).filter(
        (role) => role.id !== ROLE_IDS.USER && role.rank < (me?.maxRank ?? 0)
    );

    if (assignable.length === 0) {
        return (
            <Text variant="small" tone="muted">
                There are no roles you can assign.
            </Text>
        );
    }

    const toggle = (roleId: string, checked: boolean) =>
        onChange(checked ? [...value, roleId] : value.filter((existing) => existing !== roleId));

    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <div className="flex flex-col gap-2 rounded-md border p-3">
                {assignable.map((role) => (
                    <label key={role.id} className="flex items-start gap-2">
                        <Checkbox
                            checked={value.includes(role.id)}
                            onCheckedChange={(checked) => toggle(role.id, checked === true)}
                        />
                        <span className="flex flex-col">
                            <Text variant="small">{role.name}</Text>
                            {role.description && (
                                <Text variant="small" tone="muted">
                                    {role.description}
                                </Text>
                            )}
                        </span>
                    </label>
                ))}
            </div>
            <Text variant="small" tone="muted">
                Everyone keeps the baseline User role — these are added on top.
            </Text>
        </Field>
    );
};
