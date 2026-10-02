"use client";

import { usePathname } from "next/navigation";
import { FaviconSync } from "@/components/favicon-sync";
import { Sidebar } from "@/components/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login" || pathname === "/reset-password";

  return (
    <>
      <FaviconSync />
      {isLogin ? (
        <main className="app-content">{children}</main>
      ) : (
        <div className="app-shell"><Sidebar /><main className="app-content">{children}</main></div>
      )}
    </>
  );
}
