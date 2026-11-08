import { db } from "./db";
import { call } from "./provider";
import { refund } from "./activations";

export async function runMaintenance() {
  // 1) الارقام المنتهية بدون كود: الغاء عند المزوّد + استرجاع
  const expired = await db.activation.findMany({
    where: { status: "WAITING", expiresAt: { lt: new Date() } },
    take: 50,
  });
  let refunded = 0;
  for (const a of expired) {
    if (a.providerId) await call("setStatus", { id: a.providerId, status: "8" });
    if (await refund(a.id, "EXPIRED", "timeout (cron)")) refunded++;
  }

  // 2) حذف الحسابات غير النشطة (لو الأدمن مفعّل الخاصية)
  const get = async (k: string, d: string) => (await db.setting.findUnique({ where: { key: k } }))?.value ?? d;
  let deleted = 0;
  if ((await get("autoDeleteInactive", "false")) === "true") {
    const days = Number(await get("inactiveDays", "7"));
    const cutoff = new Date(Date.now() - days * 86_400_000);
    const r = await db.user.deleteMany({ where: { role: "USER", lastActivityAt: { lt: cutoff } } });
    deleted = r.count;
  }
  // 3) تنظيف السجلات القديمة (30 يوم)
  const old = new Date(Date.now() - 30 * 86_400_000);
  await db.providerLog.deleteMany({ where: { createdAt: { lt: old } } });
  await db.apiLog.deleteMany({ where: { createdAt: { lt: old } } });
  return { refunded, deleted };
}
