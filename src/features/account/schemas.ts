import { z } from "zod";

import { otpCodeSchema } from "@/features/auth/schemas";

export const updateProfileFormSchema = z.object({
    name: z.string().min(1).max(100).optional().or(z.literal("")),
    username: z
        .string()
        .min(3, "At least 3 characters")
        .max(30)
        .regex(/^[a-z0-9_.]+$/, "Lowercase letters, numbers, underscores and dots only")
        .optional()
        .or(z.literal("")),
    phone: z.string().min(5).max(20).optional().or(z.literal("")),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;

export const changePasswordFormSchema = z
    .object({
        currentPassword: z.string().min(1, "Required"),
        newPassword: z.string().min(8, "At least 8 characters").max(72),
        confirmPassword: z.string().min(1, "Required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export const deleteAccountOtpFormSchema = z.object({
    code: otpCodeSchema,
});

export type DeleteAccountOtpFormValues = z.infer<typeof deleteAccountOtpFormSchema>;
