import { withApiKey } from "@/lib/apiAuth";
import { fmt } from "@/lib/db";
export const dynamic = "force-dynamic";

// GET /api/v1/getBalance?api_key=KEY
export const GET = (req: Request) =>
  withApiKey(req, "getBalance", async (user) => ({ balance: fmt(user.balance) }));
