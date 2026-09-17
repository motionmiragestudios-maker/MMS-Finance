"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) return <main className="app-content">{children}</main>;

  return <div className="app-shell"><Sidebar /><main className="app-content">{children}</main></div>;
}
