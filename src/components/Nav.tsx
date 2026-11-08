"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav({ username, role }: { username: string; role: string }) {
  const path = usePathname();
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/history", label: "History" },
    { href: "/api-docs", label: "API" },
    ...(role === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="text-indigo-400">SMS</span> Panel
          </Link>
          <nav className="flex gap-1">
            {links.map((l) => {
              const active = path === l.href || (l.href !== "/dashboard" && path.startsWith(l.href));
              return (
                <Link key={l.href} href={l.href}
                  className={`rounded-lg px-3 py-1.5 text-sm ${active ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}>
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-slate-400 sm:inline">{username}</span>
          <a href="/api/auth/logout" className="btn-ghost">Logout</a>
        </div>
      </div>
    </header>
  );
}
