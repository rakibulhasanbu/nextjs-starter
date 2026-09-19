import { z } from "zod"

export const signInFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export type SignInFormValues = z.infer<typeof signInFormSchema>

export const signUpFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type SignUpFormValues = z.infer<typeof signUpFormSchema>

export const forgotFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
})

export type ForgotFormValues = z.infer<typeof forgotFormSchema>

export const otpFormSchema = z.object({
  otp: z.string().min(6, "Enter the 6-digit code"),
})

export type OtpFormValues = z.infer<typeof otpFormSchema>

export const resetPasswordFormSchema = z
  .object({
    otp: z.string().min(6, "Enter the 6-digit code"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>
