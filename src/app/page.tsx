import { HeroActions } from "@/features/auth/components/hero-actions";
import { HeroCodePanel } from "@/features/auth/components/hero-code-panel";
import { Text } from "@/components/ui/text";

export default function Home() {
    return (
        <main className="layout flex min-h-[calc(100dvh-4rem)] items-center py-12">
            <div className="grid w-full min-w-0 items-center gap-12 md:grid-cols-2 md:gap-16">
                <div className="flex min-w-0 flex-col items-start gap-6">
                    <Text variant="h1" render={<h1 />} className="text-left">
                        Skip the auth boilerplate.
                    </Text>
                    <Text variant="lead" tone="muted" className="max-w-md text-left">
                        Email and OTP verification, role-based access, and session management, wired up and ready
                        to build on.
                    </Text>

                    <HeroActions />
                </div>

                <div className="flex min-w-0 justify-center md:justify-end">
                    <HeroCodePanel />
                </div>
            </div>
        </main>
    );
}
