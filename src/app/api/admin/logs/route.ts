import { db } from "@/lib/db";
import { handle } from "@/lib/route";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";

export const GET = handle(async (req) => {
  await requireAdmin();
  const type = new URL(req.url).searchParams.get("type");
  if (type === "provider") return db.providerLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return db.apiLog.findMany({
    orderBy: { createdAt: "desc" }, take: 200,
    include: { user: { select: { username: true } } },
  });
});
