import { redirect } from "next/navigation";

import { getUserCookie } from "@/lib/auth-cookies";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
    const user = await getUserCookie();

    if (!user) {
        redirect("/auth/sign-in?callbackUrl=%2Faccount");
    }

    return <>{children}</>;
}
