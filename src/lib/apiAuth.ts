import { User } from "@prisma/client";
import { db, AppError } from "./db";
import { hashKey } from "./apiKey";

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });

export async function withApiKey(
  req: Request,
  endpoint: string,
  handler: (user: User, p: URLSearchParams) => Promise<unknown>
) {
  const t = Date.now();
  const p = new URL(req.url).searchParams;
  const key = p.get("api_key") ?? req.headers.get("x-api-key") ?? "";
  const user = key ? await db.user.findUnique({ where: { apiKeyHash: hashKey(key) } }) : null;

  let res: Response;
  if (!user) res = json({ error: "BAD_KEY" }, 401);
  else if (user.status !== "ACTIVE") res = json({ error: "ACCOUNT_NOT_ACTIVE" }, 403);
  else {
    await db.user.update({ where: { id: user.id }, data: { lastActivityAt: new Date() } });
    try {
      res = json(await handler(user, p));
    } catch (e) {
      res = e instanceof AppError ? json({ error: e.code }, 400) : json({ error: "SERVER_ERROR" }, 500);
    }
  }
  await db.apiLog
    .create({
      data: {
        userId: user?.id, endpoint, statusCode: res.status, durationMs: Date.now() - t,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0] ?? null,
      },
    })
    .catch(() => {});
  return res;
}
