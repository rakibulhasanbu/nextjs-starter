"use client";

import { usePasskeySignIn } from "@/features/passkeys/use-passkey-sign-in";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

type PasskeyEmailSignInButtonProps = {
    /** Read lazily: the email comes from the sign-in form, which the user is still typing into. */
    getEmail: () => string;
};

/**
 * The fallback for an authenticator that stored a *non-discoverable* credential.
 * Those cannot be used by the usernameless button — the server can only name the
 * allowed credentials once it knows the account — so without this path those
 * users cannot sign in with their passkey at all.
 */
export const PasskeyEmailSignInButton = ({ getEmail }: PasskeyEmailSignInButtonProps) => {
    const { isSupported, isSubmitting, signIn } = usePasskeySignIn();

    if (!isSupported) return null;

    const onClick = () => {
        const email = getEmail().trim();
        if (!email) {
            toast.add({
                title: "Enter your email first",
                description: "We need to know which account's passkey to ask for.",
                type: "info",
            });
            return;
        }
        void signIn(email);
    };

    return (
        <Button variant="link" size="sm" onClick={onClick} disabled={isSubmitting} className="h-auto self-center p-0">
            Use a passkey with my email instead
        </Button>
    );
};
