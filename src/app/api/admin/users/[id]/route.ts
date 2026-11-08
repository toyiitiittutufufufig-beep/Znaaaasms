import bcrypt from "bcryptjs";
import { db, AppError } from "@/lib/db";
import { handle } from "@/lib/route";
import { requireAdmin } from "@/lib/session";
import { generateApiKey } from "@/lib/apiKey";
export const dynamic = "force-dynamic";

export const PATCH = handle(async (req, { params }) => {
  const admin = await requireAdmin();
  const b = await req.json();
  const data: any = {};
  if (b.username) {
    const un = String(b.username).trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,32}$/.test(un)) throw new AppError("INVALID_USERNAME");
    const ex = await db.user.findUnique({ where: { username: un } });
    if (ex && ex.id !== params.id) throw new AppError("USERNAME_TAKEN");
    data.username = un;
  }
  if (b.password) {
    if (String(b.password).length < 6) throw new AppError("PASSWORD_TOO_SHORT");
    data.passwordHash = await bcrypt.hash(String(b.password), 10);
  }
  if (b.status) {
    if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(b.status)) throw new AppError("BAD_STATUS");
    if (params.id === admin.id && b.status !== "ACTIVE") throw new AppError("CANNOT_DISABLE_SELF");
    data.status = b.status;
    if (b.status === "ACTIVE") data.lastActivityAt = new Date(); // ما يتحذفش فورًا بعد التفعيل
  }
  let apiKey: string | undefined;
  if (b.regenerateKey) {
    const k = generateApiKey();
    data.apiKeyHash = k.hash; data.apiKeyPrefix = k.prefix; data.apiKeyEnc = k.enc;
    apiKey = k.key;
  }
  await db.user.update({ where: { id: params.id }, data });
  return { ok: true, apiKey };
});

export const DELETE = handle(async (_req, { params }) => {
  const admin = await requireAdmin();
  const u = await db.user.findUnique({ where: { id: params.id } });
  if (!u) throw new AppError("NOT_FOUND");
  if (u.id === admin.id || u.role === "ADMIN") throw new AppError("CANNOT_DELETE_ADMIN");
  await db.user.delete({ where: { id: params.id } });
  return { ok: true };
});
