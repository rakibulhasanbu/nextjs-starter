import { z } from "zod";

export const roleFormSchema = z.object({
    // Mirrors the backend's createRoleSchema. Immutable after creation, so the
    // edit dialog renders it read-only rather than dropping it from the form.
    id: z
        .string()
        .min(2, "At least 2 characters")
        .max(50)
        .regex(/^[a-z][a-z0-9_]*$/, "Lowercase letters, digits and underscores; must start with a letter"),
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().max(500).optional().or(z.literal("")),
    // Kept as a string: the input yields one, and `z.coerce.number()` would make
    // the form's input and output types diverge. Converted at the API boundary.
    // Capped at 99 by the backend — rank 100 is the super admin's, and nobody may
    // create a role at or above their own rank anyway.
    rank: z
        .string()
        .regex(/^\d{1,2}$/, "Enter a number from 0 to 99"),
    permissions: z.array(z.string()),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
