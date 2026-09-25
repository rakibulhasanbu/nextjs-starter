"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { loginAction } from "@/features/auth/actions";
import { signInFormSchema, SignInFormValues } from "@/features/auth/schemas";
import { PasskeyEmailSignInButton } from "@/features/passkeys/components/passkey-email-sign-in-button";
import { PasskeySignInButton } from "@/features/passkeys/components/passkey-sign-in-button";
import { useAuthStore } from "@/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { FormInput } from "@/components/shared/form-input";
import { LinkButton } from "@/components/shared/link-button";
import { LoadingButton } from "@/components/shared/loading-button";

export const SignInForm = () => {
    const setTokens = useAuthStore((state) => state.setTokens);
    const setUser = useAuthStore((state) => state.setUser);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { control, handleSubmit, getValues } = useForm<SignInFormValues>({
        resolver: zodResolver(signInFormSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        setIsSubmitting(true);
        const result = await loginAction(values.email, values.password);
        setIsSubmitting(false);

        if (result.status === "twoFactorRequired") {
            const callbackUrl = searchParams.get("callbackUrl");
            const params = new URLSearchParams({ twoFactorToken: result.twoFactorToken });
            if (callbackUrl) params.set("callbackUrl", callbackUrl);
            router.push(`/auth/2fa-verify?${params.toString()}`);
            return;
        }

        if (result.status === "error") {
            // The backend has already emailed the reactivation code by the time it
            // answers with this — the user just needs somewhere to enter it.
            if (result.code === "ACCOUNT_PENDING_DELETION") {
                toast.add({
                    title: "Account scheduled for deletion",
                    description: "We sent you a code to restore it.",
                    type: "info",
                });
                const reactivateParams = new URLSearchParams({ email: values.email });
                if (result.graceEndsAt) reactivateParams.set("graceEndsAt", result.graceEndsAt);
                router.push(`/auth/reactivate-account?${reactivateParams.toString()}`);
                return;
            }

            if (result.code === "EMAIL_NOT_VERIFIED") {
                toast.add({ title: "Verify your email", description: "We sent you a new code.", type: "info" });
                const callbackUrl = searchParams.get("callbackUrl");
                const params = new URLSearchParams({ email: values.email });
                if (callbackUrl) params.set("callbackUrl", callbackUrl);
                router.push(`/auth/verify-email?${params.toString()}`);
                return;
            }
            toast.add({ title: "Sign in failed", description: result.error, type: "error" });
            return;
        }

        setTokens({ accessToken: result.data.accessToken, refreshToken: result.data.refreshToken });
        setUser(result.data.user);

        const callbackUrl = searchParams.get("callbackUrl") || "/";
        router.replace(callbackUrl);
        router.refresh();
    });

    return (
        <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
                <FormInput
                    control={control}
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                />
                <div className="flex flex-col gap-2">
                    <FormInput
                        control={control}
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                    />
                    <LinkButton href="/auth/forgot-password" variant="link" size="sm" className="h-auto self-end p-0">
                        Forgot password?
                    </LinkButton>
                </div>
                <LoadingButton type="submit" className="w-full" isLoading={isSubmitting}>
                    Sign in
                </LoadingButton>
                <PasskeySignInButton />
                <PasskeyEmailSignInButton getEmail={() => getValues("email")} />
            </FieldGroup>
        </form>
    );
};
