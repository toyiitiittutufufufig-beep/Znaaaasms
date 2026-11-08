import { db, AppError } from "./db";
import { config } from "@/config";
import { call, requestNumber, providerPrice } from "./provider";

type EndStatus = "CANCELLED" | "EXPIRED";

// استرجاع آمن: بيشتغل مرة واحدة بس لكل تفعيل (updateMany بشرط الحالة + unique في Transaction)
export async function refund(activationId: string, status: EndStatus, note: string) {
  return db.$transaction(async (tx) => {
    const res = await tx.activation.updateMany({
      where: { id: activationId, status: "WAITING" },
      data: { status },
    });
    if (res.count !== 1) return false; // اتسترجع قبل كده او وصله كود
    const a = await tx.activation.findUniqueOrThrow({ where: { id: activationId } });
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${a.userId} FOR UPDATE`;
    const u = await tx.user.update({ where: { id: a.userId }, data: { balance: { increment: a.price } } });
    await tx.transaction.create({
      data: { userId: a.userId, activationId, type: "REFUND", amount: a.price, balanceAfter: u.balance, note },
    });
    return true;
  });
}

export async function buyNumber(userId: string, service: string, country: string, source = "web") {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== "ACTIVE") throw new AppError("ACCOUNT_NOT_ACTIVE");

  const cost = await providerPrice(service, country);
  if (cost == null) throw new AppError("NO_PRICE");
  const price = BigInt(Math.round(cost * 1e6 * (1 + config.markupPercent / 100)));

  // 1) خصم الرصيد وإنشاء التفعيل في transaction واحدة مع قفل على المستخدم
  const act = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
    const u = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    if (u.balance < price) throw new AppError("NO_BALANCE");
    const nb = u.balance - price;
    await tx.user.update({ where: { id: userId }, data: { balance: nb } });
    const a = await tx.activation.create({
      data: {
        userId, providerId: "", service, country, phone: "", price, source,
        expiresAt: new Date(Date.now() + config.activationMinutes * 60_000),
      },
    });
    await tx.transaction.create({
      data: { userId, activationId: a.id, type: "PURCHASE", amount: -price, balanceAfter: nb },
    });
    return a;
  });

  // 2) طلب الرقم من المزوّد، ولو فشل نرجّع الفلوس فورًا
  const r = await requestNumber(service, country);
  if (!r) {
    await refund(act.id, "CANCELLED", "provider returned no number");
    throw new AppError("NO_NUMBERS");
  }
  return db.activation.update({ where: { id: act.id }, data: { providerId: r.id, phone: r.phone } });
}

async function owned(userId: string, id: string) {
  const a = await db.activation.findFirst({ where: { id, userId } });
  if (!a) throw new AppError("NOT_FOUND");
  return a;
}

export async function checkActivation(userId: string, id: string) {
  const a = await owned(userId, id);
  if (a.status === "WAITING" && a.providerId) {
    const r = await call("getStatus", { id: a.providerId });
    if (r.text.startsWith("STATUS_OK:")) {
      const code = r.text.slice("STATUS_OK:".length);
      await db.activation.updateMany({
        where: { id, status: "WAITING" },
        data: { status: "CODE_RECEIVED", smsCode: code, smsText: code },
      });
    } else if (r.text === "STATUS_CANCEL") {
      await refund(id, "CANCELLED", "cancelled by provider");
    } else if (a.expiresAt < new Date()) {
      await call("setStatus", { id: a.providerId, status: "8" });
      await refund(id, "EXPIRED", "timeout");
    }
  }
  return db.activation.findUniqueOrThrow({ where: { id } });
}

export async function cancelActivation(userId: string, id: string) {
  const a = await owned(userId, id);
  if (a.status !== "WAITING") throw new AppError("CANNOT_CANCEL");
  const r = await call("setStatus", { id: a.providerId, status: "8" });
  // لو المزوّد رفض (مثلا EARLY_CANCEL_DENIED) ما نرجّعش الفلوس
  if (!/^(ACCESS_CANCEL|STATUS_CANCEL)/.test(r.text)) throw new AppError(r.text || "PROVIDER_ERROR");
  await refund(id, "CANCELLED", "user cancel");
  return db.activation.findUniqueOrThrow({ where: { id } });
}

export async function completeActivation(userId: string, id: string) {
  const a = await owned(userId, id);
  if (a.status !== "CODE_RECEIVED") throw new AppError("NO_CODE_YET");
  await call("setStatus", { id: a.providerId, status: "6" });
  return db.activation.update({ where: { id }, data: { status: "COMPLETED" } });
}

export async function requestAnotherSms(userId: string, id: string) {
  const a = await owned(userId, id);
  if (a.status !== "CODE_RECEIVED") throw new AppError("NO_CODE_YET");
  await call("setStatus", { id: a.providerId, status: "3" });
  return db.activation.update({ where: { id }, data: { status: "WAITING", smsCode: null } });
}
