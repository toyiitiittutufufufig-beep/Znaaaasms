import { AppError } from "./db";

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, (_, v) => (typeof v === "bigint" ? Number(v) / 1e6 : v)), {
    status,
    headers: { "content-type": "application/json" },
  });

export function handle(fn: (req: Request, ctx: any) => Promise<unknown>) {
  return async (req: Request, ctx: any) => {
    try {
      const r = await fn(req, ctx);
      return r instanceof Response ? r : json(r);
    } catch (e) {
      if (e instanceof AppError)
        return json({ error: e.code }, e.code === "UNAUTHORIZED" ? 401 : e.code === "FORBIDDEN" ? 403 : 400);
      console.error(e);
      return json({ error: "SERVER_ERROR" }, 500);
    }
  };
}
