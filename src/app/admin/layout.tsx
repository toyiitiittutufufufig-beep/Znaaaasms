import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import Nav from "@/components/Nav";
import AdminTabs from "@/components/AdminTabs";

export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await getUser();
  if (!u) redirect("/api/auth/logout");
  if (u.role !== "ADMIN") redirect("/dashboard");
  return (
    <>
      <Nav username={u.username} role={u.role} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <AdminTabs />
        {children}
      </main>
    </>
  );
}
