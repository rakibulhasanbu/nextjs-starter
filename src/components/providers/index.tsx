import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertProvider } from "@/components/providers/alert-provider";
import { AuthInitProvider } from "@/components/providers/auth-init-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthInitProvider>
          <AlertProvider>
            <TooltipProvider>
              <Toaster />
              {children}
            </TooltipProvider>
          </AlertProvider>
        </AuthInitProvider>
      </ThemeProvider>
    </QueryProvider>
  );
};
