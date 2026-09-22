export interface Setup2faResponse {
    otpauthUrl: string;
    qrCodeDataUrl: string;
}

export interface Enable2faResponse {
    recoveryCodes: string[];
}
