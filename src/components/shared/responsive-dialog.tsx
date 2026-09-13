"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

interface ResponsiveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    bodyClassName?: string;
    footerClassName?: string;
    showCloseButton?: boolean;
}

export const ResponsiveDialog = ({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    className,
    bodyClassName,
    footerClassName,
    showCloseButton = true,
}: ResponsiveDialogProps) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className={className}>
                    <DrawerHeader>
                        {title ? (
                            <DrawerTitle>{title}</DrawerTitle>
                        ) : (
                            <DrawerTitle className="sr-only">Dialog</DrawerTitle>
                        )}
                        {description && <DrawerDescription>{description}</DrawerDescription>}
                    </DrawerHeader>
                    <div
                        className={cn(
                            "min-h-0 min-w-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]",
                            bodyClassName
                        )}
                    >
                        {children}
                    </div>
                    {footer && <DrawerFooter className={footerClassName}>{footer}</DrawerFooter>}
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn("flex flex-col md:max-h-[90vh]", className)}
                showCloseButton={showCloseButton}
            >
                <DialogHeader>
                    {title ? (
                        <DialogTitle>{title}</DialogTitle>
                    ) : (
                        <DialogTitle className="sr-only">Dialog</DialogTitle>
                    )}
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <div
                    className={cn("min-w-0 max-h-[70vh] overflow-y-auto", bodyClassName)}
                >
                    {children}
                </div>
                {footer && <DialogFooter className={footerClassName}>{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    );
};
