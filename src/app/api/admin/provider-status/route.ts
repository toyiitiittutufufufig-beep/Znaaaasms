import { db } from "@/lib/db";
import { handle } from "@/lib/route";
import { requireAdmin } from "@/lib/session";
import { providerBalance } from "@/lib/provider";
export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  const balance = await providerBalance(); // بيتسجل كمان في ProviderLog
  const [logs, users, waiting] = await Promise.all([
    db.providerLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.user.count(),
    db.activation.count({ where: { status: "WAITING" } }),
  ]);
  const okRate = logs.length ? Math.round((100 * logs.filter((l) => l.ok).length) / logs.length) : null;
  const avgLatency = logs.length ? Math.round(logs.reduce((s, l) => s + l.latencyMs, 0) / logs.length) : null;
  return { online: balance !== null, balance, okRate, avgLatency, users, waiting, logs: logs.slice(0, 10) };
});
