import { PermissionKey } from "@/features/auth/types";

/** A named bundle of permissions. `id` is a stable slug — code references it, so it is immutable. */
export interface Role {
    id: string;
    name: string;
    description: string | null;
    /** Management hierarchy: an actor may only act on roles and users ranked strictly below them. */
    rank: number;
    /** Seeded roles the backend itself depends on — undeletable, and their name and rank are fixed. */
    isSystem: boolean;
    permissions: PermissionKey[];
    userCount: number;
    createdAt: string;
    updatedAt: string;
}

/** Served from the backend's code catalog, not the table — the table only mirrors it. */
export interface PermissionDefinition {
    key: PermissionKey;
    resource: string;
    action: string;
    /** "any" = across all records, "own" = only the actor's own records. */
    scope: "any" | "own" | "";
    description: string;
}

export interface CreateRolePayload {
    id: string;
    name: string;
    description?: string;
    rank: number;
    permissions: PermissionKey[];
}

/** `id` is immutable. For a system role, `name` and `rank` must be omitted too. */
export interface UpdateRolePayload {
    name?: string;
    description?: string;
    rank?: number;
    permissions?: PermissionKey[];
}
