"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BrandWordmark } from "@/components/brand-wordmark";
import { clearBrandingSession } from "@/lib/workspace";

const navItems = [
  { label: "Create invoice", href: "/" },
  { label: "Dashboard", href: "/finance" },
  { label: "Clients", href: "/clients" },
  { label: "Quotations", href: "/projects" },
  { label: "Invoices", href: "/invoices" },
  { label: "Payments", href: "/payments" },
  { label: "Expenses", href: "/expenses" },
  { label: "Settings", href: "/settings" },
  { label: "Notifications", href: "/notifications" },
  { label: "Profile", href: "/profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full max-w-[260px] border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="sidebar-brand">
        <BrandWordmark className="brand-wordmark--compact" />
      </div>

      <nav className="space-y-1 p-4">
        <p className="nav-label">Workspace</p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg px-3 py-2 text-sm transition hover:bg-slate-800 hover:text-white ${pathname === item.href ? "nav-active" : "text-slate-200"}`}
          >
            <span className="nav-index">{String(navItems.indexOf(item) + 1).padStart(2, "0")}</span>{item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer"><span className="status-dot" />Workspace online<button className="sidebar-logout" type="button" onClick={async () => { clearBrandingSession(); await signOut({ callbackUrl: "/login" }); }}>Log out</button></div>
    </aside>
  );
}
