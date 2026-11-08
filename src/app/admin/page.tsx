"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";

export default function Overview() {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    const load = () => api("/api/admin/provider-status").then(setD).catch((e) => setErr(e.message));
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  const stat = (label: string, value: any, tone = "") => (
    <div className="card"><div className="text-xs text-slate-400">{label}</div><div className={`mt-1 text-2xl font-bold ${tone}`}>{value ?? "—"}</div></div>
  );
  return (
    <div className="space-y-6">
      {err && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{err}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stat("Provider", d ? (d.online ? "Online" : "Offline") : "…", d?.online ? "text-emerald-300" : "text-rose-300")}
        {stat("Provider balance", d?.balance ?? "—")}
        {stat("Success rate", d?.okRate != null ? `${d.okRate}%` : "—")}
        {stat("Avg latency", d?.avgLatency != null ? `${d.avgLatency} ms` : "—")}
        {stat("Waiting numbers", d?.waiting)}
      </div>
      <section className="card p-0">
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="font-semibold">Live provider log</h2>
          <span className="text-xs text-slate-500">refreshes every 10s · {d?.users ?? "…"} users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><th className="th">Time</th><th className="th">Action</th><th className="th">OK</th><th className="th">Latency</th><th className="th">Response</th></tr></thead>
            <tbody>
              {d?.logs?.map((l: any) => (
                <tr key={l.id} className="border-t border-white/5">
                  <td className="td">{new Date(l.createdAt).toLocaleTimeString()}</td>
                  <td className="td">{l.action}</td>
                  <td className="td">{l.ok ? "✅" : "❌"}</td>
                  <td className="td">{l.latencyMs} ms</td>
                  <td className="td max-w-xs truncate text-slate-400">{l.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
