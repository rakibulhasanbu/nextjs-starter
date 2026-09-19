import { Text } from "@/components/ui/text";

export default function Home() {
  return (
    <main className="content-width flex min-h-screen flex-col items-center justify-center gap-4 py-16 text-center">
      <Text variant="h1">Next.js Starter</Text>
      <Text variant="lead" tone="muted">
        A batteries-included Next.js template with auth, Redux Toolkit Query, and a shared component
        library ready to build on.
      </Text>
    </main>
  );
}
