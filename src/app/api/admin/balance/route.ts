import { db, AppError } from "@/lib/db";
import { handle } from "@/lib/route";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";

// amount موجب = ايداع، سالب = خصم
export const POST = handle(async (req) => {
  await requireAdmin();
  const { userId, amount, note } = await req.json();
  const n = Number(amount);
  if (!userId || !Number.isFinite(n) || n === 0) throw new AppError("INVALID_AMOUNT");
  const micro = BigInt(Math.round(n * 1e6));
  const nb = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
    const u = await tx.user.findUnique({ where: { id: userId } });
    if (!u) throw new AppError("NOT_FOUND");
    const next = u.balance + micro;
    if (next < BigInt(0)) throw new AppError("NEGATIVE_BALANCE");
    await tx.user.update({ where: { id: userId }, data: { balance: next } });
    await tx.transaction.create({
      data: { userId, type: micro > BigInt(0) ? "DEPOSIT" : "ADJUSTMENT", amount: micro, balanceAfter: next, note: note || null },
    });
    return next;
  });
  return { balance: nb };
});
