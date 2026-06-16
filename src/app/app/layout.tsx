import { AppBottomNav } from "@/components/app-bottom-nav";
import { InstallAppPrompt } from "@/components/install-app-prompt";

export default function MobileAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="phone-shell relative">
      <div className="min-h-dvh pb-28">{children}</div>
      <InstallAppPrompt />
      <AppBottomNav />
    </div>
  );
}
