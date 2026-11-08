import { config } from "@/config";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, AppError } from "@/lib/db";
import { handle } from "@/lib/route";
import { createToken, COOKIE } from "@/lib/token";
export const dynamic = "force-dynamic";

export const POST = handle(async (req) => {
  const { username, password } = await req.json();
  if (!username || !password) throw new AppError("BAD_CREDENTIALS");
  const u = await db.user.findUnique({ where: { username: String(username).trim().toLowerCase() } });
  const ok = u ? await bcrypt.compare(String(password), u.passwordHash) : false;
  if (!u || !ok) throw new AppError("BAD_CREDENTIALS");
  if (u.status !== "ACTIVE") throw new AppError("ACCOUNT_NOT_ACTIVE");
  await db.user.update({ where: { id: u.id }, data: { lastLoginAt: new Date(), lastActivityAt: new Date() } });
  const res = NextResponse.json({ role: u.role });
  res.cookies.set(COOKIE, await createToken(u.id, u.role), {
    httpOnly: true, secure: config.secureCookies, sameSite: "lax", path: "/", maxAge: 7 * 86400,
  });
  return res;
});
