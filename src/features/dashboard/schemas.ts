import { z } from "zod";

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
    // Elevated roles only; the backend re-adds the baseline `user` role and
    // refuses anything ranked at or above the actor's own.
    roleIds: z.array(z.string()),
});

export type AdminUpdateUserFormValues = z.infer<typeof adminUpdateUserFormSchema>;

export const updateStatusFormSchema = z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.SUSPENDED]),
});

export type UpdateStatusFormValues = z.infer<typeof updateStatusFormSchema>;

export const inviteUserFormSchema = z.object({
    email: z.email("Enter a valid email"),
    roleIds: z.array(z.string()),
});

export type InviteUserFormValues = z.infer<typeof inviteUserFormSchema>;
