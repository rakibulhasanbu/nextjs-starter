import { PasskeyCredential } from "@/features/passkeys/types";
import type {
    AuthenticationResponseJSON,
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON,
} from "@simplewebauthn/browser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

export const passkeysKeys = {
    all: ["passkeys"] as const,
};

export const usePasskeys = () =>
    useQuery({
        queryKey: passkeysKeys.all,
        queryFn: () => apiFetch<PasskeyCredential[]>("/auth/webauthn/credentials"),
    });

export const getRegistrationOptions = () =>
    apiFetch<PublicKeyCredentialCreationOptionsJSON>("/auth/webauthn/register/options", {
        method: "POST",
    });

export const verifyRegistration = (credential: RegistrationResponseJSON, deviceName?: string) =>
    apiFetch<void>("/auth/webauthn/register/verify", {
        method: "POST",
        body: { credential, deviceName },
    });

/**
 * Usernameless (discoverable-credential) login: the authenticator itself picks
 * which account to sign in as, so no email is collected first. `skipAuth` because
 * this runs while signed out — an expired token in the store must not be attached.
 */
export const getUsernamelessLoginOptions = () =>
    apiFetch<PublicKeyCredentialRequestOptionsJSON>("/auth/webauthn/login/usernameless/options", {
        method: "POST",
        skipAuth: true,
    });

export const verifyUsernamelessLogin = (credential: AuthenticationResponseJSON) =>
    apiFetch<{ accessToken: string; refreshToken: string }>("/auth/webauthn/login/usernameless/verify", {
        method: "POST",
        body: { credential },
        skipAuth: true,
    });

/**
 * Email-first login, for an authenticator whose credential is *not*
 * discoverable: it cannot tell the browser which account it is, so the server
 * has to list the allowed credential ids — and it can only do that once it
 * knows whose account to look at. `skipAuth` for the same reason as above.
 */
export const getLoginOptions = (email: string) =>
    apiFetch<PublicKeyCredentialRequestOptionsJSON>("/auth/webauthn/login/options", {
        method: "POST",
        body: { email },
        skipAuth: true,
    });

export const verifyLogin = (email: string, credential: AuthenticationResponseJSON) =>
    apiFetch<{ accessToken: string; refreshToken: string }>("/auth/webauthn/login/verify", {
        method: "POST",
        body: { email, credential },
        skipAuth: true,
    });

export const useRemovePasskeyMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (credentialId: string) =>
            apiFetch<void>(`/auth/webauthn/credentials/${credentialId}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: passkeysKeys.all }),
    });
};

export const useRegisterPasskeyMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (deviceName?: string) => {
            const { startRegistration } = await import("@simplewebauthn/browser");
            const optionsJSON = await getRegistrationOptions();
            const credential = await startRegistration({ optionsJSON });
            await verifyRegistration(credential, deviceName);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: passkeysKeys.all }),
    });
};
