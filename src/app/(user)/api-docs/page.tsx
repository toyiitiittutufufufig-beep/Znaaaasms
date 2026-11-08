import { getUser } from "@/lib/session";
import { decryptKey } from "@/lib/apiKey";
import ApiDocs from "@/components/ApiDocs";

export const dynamic = "force-dynamic";
export default async function Page() {
  const u = (await getUser())!;
  return <ApiDocs initialKey={decryptKey(u.apiKeyEnc)} />;
}
