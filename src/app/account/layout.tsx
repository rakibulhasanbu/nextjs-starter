import { redirect } from "next/navigation";

import { getUserCookie } from "@/lib/auth-cookies";
import { AccountNav } from "@/features/account/components/account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
    const user = await getUserCookie();

    if (!user) {
        redirect("/auth/sign-in?callbackUrl=%2Faccount");
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 sm:p-6">
            <AccountNav />
            {children}
        </div>
    );
}
