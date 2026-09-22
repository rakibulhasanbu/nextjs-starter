import Link from "next/link";

import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
            <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden="true" />
            <div
                className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[28rem] w-[56rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand/15 blur-3xl"
                aria-hidden="true"
            />

            <div className="relative flex w-full max-w-sm flex-col items-center gap-8 sm:max-w-md">
                <Link href="/" className="flex items-center">
                    <Logo size="lg" />
                </Link>
                <div className="w-full">{children}</div>
            </div>
        </div>
    );
}
