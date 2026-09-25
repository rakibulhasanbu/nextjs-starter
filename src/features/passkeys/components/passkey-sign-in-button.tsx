"use client";

import { usePasskeySignIn } from "@/features/passkeys/use-passkey-sign-in";
import { KeyRoundIcon } from "lucide-react";

import { LoadingButton } from "@/components/shared/loading-button";

/**
 * Usernameless sign-in: the authenticator holds a discoverable credential that
 * identifies the account, so no email is collected first. Rendered only when the
 * browser supports WebAuthn at all.
 */
export const PasskeySignInButton = () => {
    const { isSupported, isSubmitting, signIn } = usePasskeySignIn();

    if (!isSupported) return null;

    return (
        <LoadingButton variant="outline" onClick={() => void signIn()} isLoading={isSubmitting} className="w-full">
            <KeyRoundIcon data-icon="inline-start" />
            Sign in with a passkey
        </LoadingButton>
    );
};
