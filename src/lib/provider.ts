import { config } from "@/config";
import { db } from "./db";

export async function call(action: string, params: Record<string, string> = {}) {
  const url = new URL(config.virtualsms.baseUrl);
  url.searchParams.set("api_key", config.virtualsms.apiKey);
  url.searchParams.set("action", action);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const t = Date.now();
  let text = "", status = 0, ok = false;
  try {
    const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    status = r.status;
    text = (await r.text()).trim();
    ok = r.ok && !/^(BAD_KEY|BAD_ACTION|BANNED|ERROR_SQL)/.test(text);
  } catch (e) {
    text = "NETWORK_ERROR";
  }
  // سجل حي لحالة المزوّد (بدون المفتاح)
  await db.providerLog
    .create({ data: { action, ok, statusCode: status, latencyMs: Date.now() - t, response: text.slice(0, 300) } })
    .catch(() => {});
  return { ok, text };
}

// ACCESS_NUMBER:ID:PHONE
export async function requestNumber(service: string, country: string) {
  const extra: Record<string, string> = {};
  if (config.virtualsms.poolProvider) extra.poolProvider = config.virtualsms.poolProvider;
  const r = await call("getNumber", { service, country, ...extra });
  const m = r.text.match(/^ACCESS_NUMBER:([^:]+):(.+)$/);
  return m ? { id: m[1], phone: m[2] } : null;
}

// سعر المزوّد (قبل الهامش) كرقم عشري
export async function providerPrice(service: string, country: string): Promise<number | null> {
  const r = await call("getPrices", { service, country });
  try {
    const j = JSON.parse(r.text);
    const cost = j?.[country]?.[service]?.cost;
    return cost != null ? Number(cost) : null;
  } catch {
    return null;
  }
}

export async function providerBalance(): Promise<number | null> {
  const r = await call("getBalance");
  const m = r.text.match(/^ACCESS_BALANCE:(.+)$/);
  return m ? Number(m[1]) : null;
}
