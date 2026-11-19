"use client";

import React, { useState } from "react";

import { CircleCheckBig, CircleHelp, MessageCircleWarning, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { AlertType, FireProps } from "@/components/providers/alert-provider";

type AlertDialogProps = Omit<Required<FireProps>, "title" | "text"> & {
    title?: React.ReactNode;
    text?: React.ReactNode;
    closeDialog: () => void;
};

export const AlertDialogContent = (props: AlertDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <DialogContent className="w-md max-w-lg min-w-95 space-y-4 p-4 lg:p-6">
            <div>
                {props.showIcon && (
                    <div className="mb-6 flex items-center justify-center">
                        {props.type === AlertType.ERROR ? (
                            <Trash2 size={64} className="text-destructive" />
                        ) : props.type === AlertType.SUCCESS ? (
                            <CircleCheckBig size={64} className="text-success" />
                        ) : props.type === AlertType.WARNING ? (
                            <MessageCircleWarning size={64} className="text-warning" />
                        ) : (
                            <CircleHelp size={64} />
                        )}
                    </div>
                )}
                <DialogTitle
                    className={cn(
                        `my-0 mt-4 text-center text-2xl font-medium ${props.type === AlertType.ERROR && "text-destructive"}`,
                        props.confirmButtonOptions.className
                    )}
                >
                    {props.title}
                </DialogTitle>
                {props.text && (
                    <DialogDescription className="mt-2 text-center text-sm text-foreground">
                        {props.text}
                    </DialogDescription>
                )}
                {error && <DialogDescription className="text-destructive-foreground mt-2">{error}</DialogDescription>}
            </div>
            <DialogFooter className="my-0 grid grid-cols-2 gap-4">
                {props.showCancelButton && (
                    <Button
                        variant={props.cancelButtonOptions.variant}
                        onClick={async () => {
                            await props.onCancel();
                            props.closeDialog();
                        }}
                        disabled={loading}
                        className="cursor-pointer"
                    >
                        {props.cancelButtonOptions.text}
                    </Button>
                )}
                <Button
                    variant={props.confirmButtonOptions.variant}
                    onClick={async () => {
                        setLoading(true);
                        const response = await props.onConfirm();
                        setLoading(false);

                        if (response?.error) {
                            setError(response.error);
                            return;
                        }

                        props.closeDialog();
                    }}
                    disabled={loading}
                    className="cursor-pointer"
                >
                    {loading && <Spinner className="size-5" />}
                    {props.confirmButtonOptions.text}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};
