import { z } from "zod";

import { UserRole } from "@/features/auth/types";
import { UserStatus } from "@/features/dashboard/types";

export const adminUpdateUserFormSchema = z.object({
    email: z.email("Enter a valid email").optional().or(z.literal("")),
    name: z.string().min(1).max(100).optional().or(z.literal("")),
    username: z
        .string()
        .min(3, "At least 3 characters")
        .max(30)
        .regex(/^[a-z0-9_.]+$/, "Lowercase letters, numbers, underscores and dots only")
        .optional()
        .or(z.literal("")),
    phone: z.string().min(5).max(20).optional().or(z.literal("")),
    // SUPER_ADMIN can never be assigned here — it's a seed-only singleton.
    role: z.enum([UserRole.USER, UserRole.ADMIN]),
});

export type AdminUpdateUserFormValues = z.infer<typeof adminUpdateUserFormSchema>;

export const updateStatusFormSchema = z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.SUSPENDED]),
});

export type UpdateStatusFormValues = z.infer<typeof updateStatusFormSchema>;

export const inviteAdminFormSchema = z.object({
    email: z.email("Enter a valid email"),
});

export type InviteAdminFormValues = z.infer<typeof inviteAdminFormSchema>;
