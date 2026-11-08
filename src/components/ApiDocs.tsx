"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";

export default function ApiDocs({ initialKey }: { initialKey: string }) {
  const [key, setKey] = useState(initialKey);
  const [show, setShow] = useState(false);
  const [origin, setOrigin] = useState("https://YOUR-SITE.vercel.app");
  const [msg, setMsg] = useState("");
  useEffect(() => setOrigin(location.origin), []);

  async function regen() {
    if (!confirm("Generate a new API key? The old key stops working immediately.")) return;
    try {
      const r = await api<{ apiKey: string }>("/api/me/regenerate-key", { method: "POST", body: {} });
      setKey(r.apiKey); setShow(true); setMsg("New key generated. Update your bots.");
    } catch (e: any) { setMsg(e.message); }
  }

  const K = key || "YOUR_API_KEY";
  const base = `${origin}/api/v1`;
  const endpoints = [
    { t: "Buy a number", u: `${base}/getNumber?api_key=${K}&service=wa&country=0`, r: `{ "id": "clx...", "phone": "79991234567", "expiresAt": "...", "price": 0.24 }` },
    { t: "Check status / get code", u: `${base}/getStatus?api_key=${K}&id=ACTIVATION_ID`, r: `{ "status": "WAITING" | "CODE_RECEIVED" | "CANCELLED" | "EXPIRED", "code": "12345" }` },
    { t: "Cancel + refund (status=8) · Finish (6) · Another SMS (3)", u: `${base}/setStatus?api_key=${K}&id=ACTIVATION_ID&status=8`, r: `{ "id": "clx...", "status": "CANCELLED" }` },
    { t: "Balance", u: `${base}/getBalance?api_key=${K}`, r: `{ "balance": 12.5 }` },
  ];

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">Your API key</h2>
        <div className="flex flex-wrap items-center gap-2">
          <code className="flex-1 break-all rounded-xl bg-slate-900 px-4 py-3 text-sm">
            {key ? (show ? key : key.slice(0, 9) + "•".repeat(24)) : "Key unavailable — regenerate"}
          </code>
          <button className="btn-ghost" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
          <button className="btn-ghost" onClick={() => key && navigator.clipboard.writeText(key)}>Copy</button>
          <button className="btn-danger" onClick={regen}>Regenerate</button>
        </div>
        {msg && <p className="text-sm text-emerald-300">{msg}</p>}
        <p className="text-xs text-slate-500">Keep it secret. You can also send it as an <code>x-api-key</code> header.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Endpoints</h2>
        {endpoints.map((e) => (
          <div key={e.t} className="card space-y-2">
            <div className="text-sm font-medium text-indigo-300">GET · {e.t}</div>
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-200">{e.u}</pre>
            <pre className="overflow-x-auto rounded-xl bg-slate-900/60 p-3 text-xs text-slate-400">{e.r}</pre>
          </div>
        ))}
        <div className="card space-y-2">
          <div className="text-sm font-medium text-indigo-300">Errors</div>
          <p className="text-sm text-slate-300">Failures return <code>{`{ "error": "CODE" }`}</code> — e.g. <code>BAD_KEY</code>, <code>ACCOUNT_NOT_ACTIVE</code>, <code>NO_BALANCE</code>, <code>NO_NUMBERS</code> (you are not charged), <code>EARLY_CANCEL_DENIED</code>.</p>
          <div className="text-sm font-medium text-indigo-300">Python example</div>
          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-200">{`import requests, time
B = "${base}"; K = "${K}"
n = requests.get(f"{B}/getNumber", params={"api_key": K, "service": "wa", "country": 0}).json()
for _ in range(60):
    s = requests.get(f"{B}/getStatus", params={"api_key": K, "id": n["id"]}).json()
    if s["status"] == "CODE_RECEIVED":
        print(s["code"]); break
    time.sleep(5)`}</pre>
        </div>
      </section>
    </div>
  );
}
