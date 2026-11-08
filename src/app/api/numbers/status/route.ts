import { handle } from "@/lib/route";
import { requireUser } from "@/lib/session";
import { checkActivation } from "@/lib/activations";
import { AppError } from "@/lib/db";
export const dynamic = "force-dynamic";

export const GET = handle(async (req) => {
  const u = await requireUser();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) throw new AppError("MISSING_PARAMS");
  return checkActivation(u.id, id);
});
