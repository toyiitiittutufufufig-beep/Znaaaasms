import { config } from "@/config";
import { runMaintenance } from "@/lib/cron";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (secret !== config.cronSecret) return new Response("forbidden", { status: 403 });
  return Response.json(await runMaintenance());
}
