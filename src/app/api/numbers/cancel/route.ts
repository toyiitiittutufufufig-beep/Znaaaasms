import { handle } from "@/lib/route";
import { requireUser } from "@/lib/session";
import { cancelActivation } from "@/lib/activations";
import { AppError } from "@/lib/db";
export const dynamic = "force-dynamic";

export const POST = handle(async (req) => {
  const u = await requireUser();
  const { id } = await req.json();
  if (!id) throw new AppError("MISSING_PARAMS");
  return cancelActivation(u.id, id);
});
