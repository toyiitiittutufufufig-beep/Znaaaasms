import { db } from "@/lib/db";
import { handle } from "@/lib/route";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";

const get = async (k: string, d: string) => (await db.setting.findUnique({ where: { key: k } }))?.value ?? d;

export const GET = handle(async () => {
  await requireAdmin();
  return {
    autoDeleteInactive: (await get("autoDeleteInactive", "false")) === "true",
    inactiveDays: Number(await get("inactiveDays", "7")),
  };
});

export const POST = handle(async (req) => {
  await requireAdmin();
  const b = await req.json();
  const days = Math.max(1, Math.min(365, Number(b.inactiveDays) || 7));
  for (const [key, value] of [["autoDeleteInactive", String(!!b.autoDeleteInactive)], ["inactiveDays", String(days)]])
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  return { ok: true };
});
