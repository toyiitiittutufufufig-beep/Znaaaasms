import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import Nav from "@/components/Nav";

export const dynamic = "force-dynamic";
export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const u = await getUser();
  if (!u) redirect("/api/auth/logout"); // يمسح الكوكي ويرجع لصفحة الدخول
  return (
    <>
      <Nav username={u.username} role={u.role} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
