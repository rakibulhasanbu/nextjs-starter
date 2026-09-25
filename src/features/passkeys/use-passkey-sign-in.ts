"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { establishPasskeySessionAction } from "@/features/auth/actions";
import {
    getLoginOptions,
    getUsernamelessLoginOptions,
    verifyLogin,
    verifyUsernamelessLogin,
} from "@/features/passkeys/api";
import { useAuthStore } from "@/store/auth-store";

import { ApiError } from "@/lib/api-client";
import { toast } from "@/components/ui/toast";

/**
 * Both passkey sign-in paths, which differ only in whether an email is known up
 * front: usernameless needs a discoverable credential, the email-first path
 * works with any credential the account has registered. Everything after the
 * authenticator responds — moving the tokens into the httpOnly cookies, seeding
 * the store, redirecting — is identical, hence one hook.
 */
export const usePasskeySignIn = () => {
    const setTokens = useAuthStore((state) => state.setTokens);
    const setUser = useAuthStore((state) => state.setUser);
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isSupported, setIsSupported] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        import("@simplewebauthn/browser").then(({ browserSupportsWebAuthn }) =>
            setIsSupported(browserSupportsWebAuthn())
        );
    }, []);

    const signIn = async (email?: string) => {
        setIsSubmitting(true);
        try {
            const { startAuthentication } = await import("@simplewebauthn/browser");
            const optionsJSON = email ? await getLoginOptions(email) : await getUsernamelessLoginOptions();
            const credential = await startAuthentication({ optionsJSON });
            const tokens = email ? await verifyLogin(email, credential) : await verifyUsernamelessLogin(credential);

            // The tokens have to reach the httpOnly cookies the proxy reads, and
            // only a server action can set those.
            const result = await establishPasskeySessionAction(tokens);
            if (result.status === "error") {
                toast.add({ title: "Sign in failed", description: result.error, type: "error" });
                return;
            }

            setTokens(tokens);
            setUser(result.data.user);
            router.replace(searchParams.get("callbackUrl") || "/");
            router.refresh();
        } catch (error) {
            // Dismissing the browser prompt is a cancellation, not a failure.
            if (error instanceof Error && error.name === "NotAllowedError") return;
            toast.add({
                title: "Sign in failed",
                description: error instanceof ApiError ? error.message : "Couldn't use a passkey",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSupported, isSubmitting, signIn };
};
