import { withApiKey } from "@/lib/apiAuth";
import { checkActivation } from "@/lib/activations";
import { AppError } from "@/lib/db";
export const dynamic = "force-dynamic";

// GET /api/v1/getStatus?api_key=KEY&id=ACTIVATION_ID
export const GET = (req: Request) =>
  withApiKey(req, "getStatus", async (user, p) => {
    const id = p.get("id");
    if (!id) throw new AppError("MISSING_PARAMS");
    const a = await checkActivation(user.id, id);
    return { id: a.id, status: a.status, phone: a.phone, code: a.smsCode, expiresAt: a.expiresAt };
  });
