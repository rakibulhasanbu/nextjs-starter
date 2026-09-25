/** A registered authenticator. The public key and signature counter stay server-side. */
export interface PasskeyCredential {
    id: string;
    credentialId: string;
    deviceName: string | null;
    transports: string[];
    createdAt: string;
    lastUsedAt: string | null;
}
