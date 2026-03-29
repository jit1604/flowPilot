"use client";

import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/dashboard";

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden bg-background">
      <div className="fp-mesh" aria-hidden />
      <AppSidebar pathname={pathname} />
      <div className="fp-main flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-11">{children}</main>
      </div>
    </div>
  );
}
