"use client";

import React, { useEffect, useRef } from "react";

import { useAuthStore } from "@/store/auth-store";
import { User } from "@/features/auth/types";

type Props = {
    children: React.ReactNode;
    accessToken?: string;
    refreshToken?: string;
    user?: User;
};

export const TokenInitiatorInStore = ({
    children,
    accessToken,
    refreshToken,
    user,
}: Props) => {
    const setTokens = useAuthStore((state) => state.setTokens);
    const setUser = useAuthStore((state) => state.setUser);
    const setState = useAuthStore((state) => state.setState);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) return;

        if (accessToken && refreshToken) {
            setTokens({ accessToken, refreshToken });
            if (user) {
                setUser(user);
            }
        } else {
            setState("success");
        }

        hasInitialized.current = true;
    }, [ accessToken, refreshToken, user, setTokens, setUser, setState ]);

    return <>{ children }</>;
};