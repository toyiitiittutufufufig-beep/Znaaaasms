import { handle } from "@/lib/route";
import { requireUser } from "@/lib/session";
export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const u = await requireUser();
  return { username: u.username, role: u.role, balance: u.balance, apiKeyPrefix: u.apiKeyPrefix };
});
