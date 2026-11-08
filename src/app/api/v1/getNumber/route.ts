import { withApiKey } from "@/lib/apiAuth";
import { buyNumber } from "@/lib/activations";
import { AppError, fmt } from "@/lib/db";
export const dynamic = "force-dynamic";

// GET /api/v1/getNumber?api_key=KEY&service=wa&country=0
export const GET = (req: Request) =>
  withApiKey(req, "getNumber", async (user, p) => {
    const service = p.get("service"), country = p.get("country");
    if (!service || !country) throw new AppError("MISSING_PARAMS");
    const a = await buyNumber(user.id, service, country, "api");
    return { id: a.id, phone: a.phone, expiresAt: a.expiresAt, price: fmt(a.price) };
  });
