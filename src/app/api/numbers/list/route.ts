import { db } from "@/lib/db";
import { handle } from "@/lib/route";
import { requireUser } from "@/lib/session";
export const dynamic = "force-dynamic";

export const GET = handle(async (req) => {
  const u = await requireUser();
  const active = new URL(req.url).searchParams.get("active") === "1";
  return db.activation.findMany({
    where: { userId: u.id, ...(active ? { status: { in: ["WAITING", "CODE_RECEIVED"] } } : {}) },
    orderBy: { createdAt: "desc" },
    take: active ? 20 : 50,
  });
});
