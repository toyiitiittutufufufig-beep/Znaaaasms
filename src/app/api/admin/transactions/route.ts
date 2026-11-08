import { db } from "@/lib/db";
import { handle } from "@/lib/route";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  return db.transaction.findMany({
    orderBy: { createdAt: "desc" }, take: 200,
    include: { user: { select: { username: true } } },
  });
});
