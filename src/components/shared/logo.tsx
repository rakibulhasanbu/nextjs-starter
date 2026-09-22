import { cn } from "@/lib/utils";

type LogoProps = {
    size?: "sm" | "md" | "lg";
    className?: string;
};

const sizeClasses = {
    sm: { mark: "size-6 text-[13px]", text: "text-base" },
    md: { mark: "size-7 text-sm", text: "text-lg" },
    lg: { mark: "size-9 text-base", text: "text-2xl" },
};

export const Logo = ({ size = "md", className }: LogoProps) => {
    const s = sizeClasses[size];

    return (
        <span className={cn("inline-flex items-center gap-2 font-heading font-semibold text-foreground", className)}>
            <span
                className={cn(
                    "inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand/60 font-bold text-brand-foreground shadow-sm",
                    s.mark,
                )}
                aria-hidden="true"
            >
                N
            </span>
            <span className={cn("tracking-tight", s.text)}>Nextbase</span>
        </span>
    );
};
