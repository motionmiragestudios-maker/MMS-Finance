"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Create invoice", href: "/" },
  { label: "Dashboard", href: "/finance" },
  { label: "Clients", href: "/clients" },
  { label: "Projects", href: "/projects" },
  { label: "Invoices", href: "/invoices" },
  { label: "Payments", href: "/payments" },
  { label: "Expenses", href: "/expenses" },
  { label: "Settings", href: "/settings" },
  { label: "Profile", href: "/profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full max-w-[260px] border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="sidebar-brand">
        <div className="brand-symbol" aria-hidden="true"><span>M</span><i /></div>
        <div><div className="brand-name">Motion Mirage</div><div className="brand-caption">Studio operations</div></div>
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
      <div className="sidebar-footer"><span className="status-dot" />Workspace online</div>
    </aside>
  );
}
