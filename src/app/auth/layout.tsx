import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 sm:px-6">
      <Logo size="lg" />
      <div className="w-full max-w-sm sm:max-w-md">{children}</div>
    </div>
  );
}
