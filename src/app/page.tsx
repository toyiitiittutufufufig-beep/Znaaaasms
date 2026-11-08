import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export default async function Home() {
  const u = await getUser();
  redirect(u ? (u.role === "ADMIN" ? "/admin" : "/dashboard") : "/login");
}
