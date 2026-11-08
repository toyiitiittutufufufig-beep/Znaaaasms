import { handle } from "@/lib/route";
import { requireUser } from "@/lib/session";
import { buyNumber } from "@/lib/activations";
import { AppError } from "@/lib/db";
export const dynamic = "force-dynamic";

export const POST = handle(async (req) => {
  const u = await requireUser();
  const { service, country } = await req.json();
  if (!service || country === undefined || country === null) throw new AppError("MISSING_PARAMS");
  return buyNumber(u.id, String(service), String(country), "web");
});
