"use client";

import React, { createContext, useState } from "react";

import { AlertDialogContent } from "@/components/shared/alert-dialog";
import { Dialog } from "@/components/ui/dialog";

export type ButtonOptionsType = {
    variant?: "default" | "destructive" | "outline" | "ghost" | "link";
    // | "destructiveOutline" | "accent";
    text?: string;
    className?: string;
};

export enum AlertType {
    ERROR = "error",
    SUCCESS = "success",
    WARNING = "warning",
    INFO = "info",
}

export type FireProps = {
    title?: React.ReactNode;
    text?: React.ReactNode;

    type?: AlertType;
    showIcon?: boolean;

    onConfirm: () => Promise<{ error?: string } | void> | void;
    confirmButtonOptions?: ButtonOptionsType;

    showCancelButton?: boolean;
    onCancel?: () => Promise<void> | void;
    cancelButtonOptions?: ButtonOptionsType;
};

type AlertContextType = {
    fire: (props: FireProps) => Promise<void> | void;
};

export const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    const [ open, setOpen ] = useState(false);
    const [ title, setTitle ] = useState<React.ReactNode | null>(null);
    const [ text, setText ] = useState<React.ReactNode | null>(null);

    const [ showIcon, setShowIcon ] = useState(true);
    const [ type, setType ] = useState<AlertType>(AlertType.INFO);

    const [ onConfirm, setOnConfirm ] = useState<() => void>(() => { });
    const [ confirmButtonOptions, setConfirmButtonOptions ] = useState<ButtonOptionsType>({
        variant: "destructive",
        text: "Delete",
    });

    const [ showCancelButton, setShowCancelButton ] = useState(true);
    const [ onCancel, setOnCancel ] = useState<() => void>(() => { });
    const [ cancelButtonOptions, setCancelButtonOptions ] = useState<ButtonOptionsType>({
        variant: "outline",
        text: "Cancel",
    });

    const fire = async (props: FireProps) => {
        setOpen(true);
        setTitle(props.title || "Are you sure?");
        setText(props.text || null);

        setShowIcon(props.showIcon || true);
        setType(props.type ?? AlertType.INFO);

        setOnConfirm(() => props.onConfirm);
        setConfirmButtonOptions({
            variant: props.confirmButtonOptions?.variant || (props.type === AlertType.ERROR ? "destructive" : "default"),
            text: props.confirmButtonOptions?.text || "Confirm",
            className: props.confirmButtonOptions?.className,
        });

        setShowCancelButton(props.showCancelButton ?? true);
        setOnCancel(() => () => {
            if (props.onCancel) return onCancel();

            return () => { };
        });
        setCancelButtonOptions({
            variant: props.cancelButtonOptions?.variant || "outline",
            text: props.cancelButtonOptions?.text || "Cancel",
        });
    };

    return (
        <AlertContext.Provider value={ { fire } }>
            { children }
            <Dialog open={ open } onOpenChange={ setOpen }>
                { open && (
                    <AlertDialogContent
                        title={ title }
                        text={ text }
                        showIcon={ showIcon }
                        type={ type }
                        onConfirm={ onConfirm }
                        confirmButtonOptions={ confirmButtonOptions }
                        showCancelButton={ showCancelButton }
                        onCancel={ onCancel }
                        cancelButtonOptions={ cancelButtonOptions }
                        closeDialog={ () => setOpen(false) }
                    />
                ) }
            </Dialog>
        </AlertContext.Provider>
    );
};
