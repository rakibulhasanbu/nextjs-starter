import { HomeAuthActions } from "@/features/auth/components/home-auth-actions";
import { Text } from "@/components/ui/text";

export default function Home() {
    return (
        <main className="content-width flex min-h-screen flex-col items-center justify-center gap-6 py-16 text-center">
            <Text variant="h1" render={<h1 />} className="max-w-2xl">
                A Next.js starter with auth already wired up.
            </Text>
            <Text variant="lead" tone="muted" className="max-w-xl">
                Batteries-included template with authentication, Redux Toolkit Query, and a shared component library
                ready to build on.
            </Text>

            <HomeAuthActions />
        </main>
    );
}
