import bcrypt from "bcryptjs";
import { db, AppError } from "@/lib/db";
import { handle } from "@/lib/route";
import { requireAdmin } from "@/lib/session";
import { generateApiKey } from "@/lib/apiKey";
export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });
  return users.map(({ passwordHash, apiKeyHash, apiKeyEnc, ...u }) => u);
});

export const POST = handle(async (req) => {
  await requireAdmin();
  const b = await req.json();
  const username = String(b.username ?? "").trim().toLowerCase();
  if (!/^[a-z0-9_.-]{3,32}$/.test(username)) throw new AppError("INVALID_USERNAME");
  if (String(b.password ?? "").length < 6) throw new AppError("PASSWORD_TOO_SHORT");
  if (await db.user.findUnique({ where: { username } })) throw new AppError("USERNAME_TAKEN");
  const status = ["ACTIVE", "INACTIVE", "SUSPENDED"].includes(b.status) ? b.status : "ACTIVE";
  const bal = BigInt(Math.max(0, Math.round(Number(b.balance || 0) * 1e6)));
  const k = generateApiKey();
  const u = await db.user.create({
    data: {
      username, status, balance: bal,
      passwordHash: await bcrypt.hash(String(b.password), 10),
      apiKeyHash: k.hash, apiKeyPrefix: k.prefix, apiKeyEnc: k.enc,
    },
  });
  if (bal > BigInt(0))
    await db.transaction.create({ data: { userId: u.id, type: "DEPOSIT", amount: bal, balanceAfter: bal, note: "Initial balance" } });
  return { id: u.id, username: u.username, apiKey: k.key };
});
