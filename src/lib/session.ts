import { cookies } from "next/headers";
import { db, AppError } from "./db";
import { COOKIE, readToken } from "./token";

export async function getUser() {
  const s = await readToken(cookies().get(COOKIE)?.value);
  if (!s) return null;
  const u = await db.user.findUnique({ where: { id: s.uid } });
  if (!u || u.status !== "ACTIVE") return null; // الموقوف يتفصل فورًا
  if (Date.now() - u.lastActivityAt.getTime() > 60_000)
    await db.user.update({ where: { id: u.id }, data: { lastActivityAt: new Date() } }).catch(() => {});
  return u;
}
export async function requireUser() {
  const u = await getUser();
  if (!u) throw new AppError("UNAUTHORIZED");
  return u;
}
export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== "ADMIN") throw new AppError("FORBIDDEN");
  return u;
}
