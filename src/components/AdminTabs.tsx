"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Overview" }, { href: "/admin/users", label: "Users" },
  { href: "/admin/transactions", label: "Transactions" }, { href: "/admin/logs", label: "Logs" },
  { href: "/admin/settings", label: "Settings" },
];
export default function AdminTabs() {
  const p = usePathname();
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${p === t.href ? "bg-indigo-500 text-white" : "border border-white/10 text-slate-300 hover:bg-white/5"}`}>
          {t.label}
        </Link>
      ))}
    </div>
  );
}
