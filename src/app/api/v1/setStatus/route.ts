import { withApiKey } from "@/lib/apiAuth";
import { cancelActivation, completeActivation, requestAnotherSms } from "@/lib/activations";
import { AppError } from "@/lib/db";
export const dynamic = "force-dynamic";

// GET /api/v1/setStatus?api_key=KEY&id=ID&status=8   (8 الغاء+استرجاع | 6 اكتمال | 3 طلب رسالة تانية)
export const GET = (req: Request) =>
  withApiKey(req, "setStatus", async (user, p) => {
    const id = p.get("id"), status = p.get("status");
    if (!id || !status) throw new AppError("MISSING_PARAMS");
    const a =
      status === "8" ? await cancelActivation(user.id, id)
      : status === "6" ? await completeActivation(user.id, id)
      : status === "3" ? await requestAnotherSms(user.id, id)
      : (() => { throw new AppError("BAD_STATUS"); })();
    return { id: a.id, status: a.status };
  });
