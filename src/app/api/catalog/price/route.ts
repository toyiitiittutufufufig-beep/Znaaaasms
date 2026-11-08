import { handle } from "@/lib/route";
import { requireUser } from "@/lib/session";
import { providerPrice } from "@/lib/provider";
import { config } from "@/config";
import { AppError } from "@/lib/db";
export const dynamic = "force-dynamic";

export const GET = handle(async (req) => {
  await requireUser();
  const p = new URL(req.url).searchParams;
  const service = p.get("service"), country = p.get("country");
  if (!service || !country) throw new AppError("MISSING_PARAMS");
  const cost = await providerPrice(service, country);
  if (cost == null) return { price: null };
  return { price: Math.round(cost * (1 + config.markupPercent / 100) * 10000) / 10000 };
});
