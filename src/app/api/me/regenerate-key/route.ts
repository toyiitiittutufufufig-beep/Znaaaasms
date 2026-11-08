import { db } from "@/lib/db";
import { handle } from "@/lib/route";
import { requireUser } from "@/lib/session";
import { generateApiKey } from "@/lib/apiKey";
export const dynamic = "force-dynamic";

export const POST = handle(async () => {
  const u = await requireUser();
  const k = generateApiKey();
  await db.user.update({ where: { id: u.id }, data: { apiKeyHash: k.hash, apiKeyPrefix: k.prefix, apiKeyEnc: k.enc } });
  return { apiKey: k.key };
});
