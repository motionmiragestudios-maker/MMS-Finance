"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Create invoice", href: "/" },
  { label: "Dashboard", href: "/finance" },
  { label: "Clients", href: "/clients" },
  { label: "Vendors", href: "/vendors" },
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
      <div className="border-b border-slate-800 px-6 py-5">
        <div className="text-lg font-semibold">Motion Mirage</div>
        <div className="text-sm text-slate-400">Finance system</div>
      </div>

      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg px-3 py-2 text-sm transition hover:bg-slate-800 hover:text-white ${pathname === item.href ? "nav-active" : "text-slate-200"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
