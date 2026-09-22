import { z } from "zod";

import { otpCodeSchema } from "@/features/auth/schemas";

export const enable2faFormSchema = z.object({
    code: otpCodeSchema,
});

export type Enable2faFormValues = z.infer<typeof enable2faFormSchema>;

export const disable2faFormSchema = z.object({
    password: z.string().min(1, "Password is required"),
    code: otpCodeSchema,
});

export type Disable2faFormValues = z.infer<typeof disable2faFormSchema>;
