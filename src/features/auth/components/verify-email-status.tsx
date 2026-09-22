"use client";

import { useEffect, useRef, useState } from "react";

import { useSearchParams } from "next/navigation";

import { CheckCircle2Icon, XCircleIcon } from "lucide-react";

import { LinkButton } from "@/components/shared/link-button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { verifyEmailAction } from "@/features/auth/actions";

type Status = "pending" | "success" | "error";

export const VerifyEmailStatus = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<Status>(token ? "pending" : "error");
    const [error, setError] = useState<string | null>(
        token ? null : "This verification link is missing its token."
    );
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current || !token) return;
        hasRun.current = true;

        verifyEmailAction(token).then((result) => {
            if (result.status === "error") {
                setStatus("error");
                setError(result.error);
                return;
            }
            setStatus("success");
        });
    }, [token]);

    if (status === "pending") {
        return (
            <Empty className="border-none p-0">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Spinner className="size-6" />
                    </EmptyMedia>
                    <EmptyTitle>Verifying your email...</EmptyTitle>
                </EmptyHeader>
            </Empty>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col gap-6">
                <Empty className="border-none p-0">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <XCircleIcon className="text-destructive" />
                        </EmptyMedia>
                        <EmptyTitle>Verification failed</EmptyTitle>
                        <EmptyDescription>{error || "This link is invalid or has expired."}</EmptyDescription>
                    </EmptyHeader>
                </Empty>
                <LinkButton href="/auth/sign-in" className="w-full">
                    Back to sign in
                </LinkButton>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <Empty className="border-none p-0">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <CheckCircle2Icon className="text-success" />
                    </EmptyMedia>
                    <EmptyTitle>Email verified</EmptyTitle>
                    <EmptyDescription>Your account is active — you can sign in now.</EmptyDescription>
                </EmptyHeader>
            </Empty>
            <LinkButton href="/auth/sign-in" className="w-full">
                Sign in
            </LinkButton>
        </div>
    );
};
