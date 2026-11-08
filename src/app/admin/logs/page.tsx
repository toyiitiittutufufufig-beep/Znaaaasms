"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";

export default function Logs() {
  const [tab, setTab] = useState<"api" | "provider">("api");
  const [rows, setRows] = useState<any[]>([]);
  const [live, setLive] = useState(true);
  useEffect(() => {
    const load = () => api<any[]>(`/api/admin/logs?type=${tab}`).then(setRows).catch(() => {});
    load();
    if (!live) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [tab, live]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["api", "provider"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === t ? "bg-white/10" : "text-slate-400"}`}>
              {t === "api" ? "Users API requests" : "Provider (virtualsms.de)"}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} /> Live (5s)
        </label>
      </div>
      <div className="card overflow-x-auto p-0">
        {tab === "api" ? (
          <table className="w-full">
            <thead><tr><th className="th">Time</th><th className="th">User</th><th className="th">Endpoint</th><th className="th">Status</th><th className="th">IP</th><th className="th">ms</th></tr></thead>
            <tbody>{rows.map((l) => (
              <tr key={l.id} className="border-t border-white/5">
                <td className="td">{new Date(l.createdAt).toLocaleString()}</td><td className="td">{l.user?.username ?? "—"}</td>
                <td className="td">{l.endpoint}</td><td className={`td ${l.statusCode >= 400 ? "text-rose-300" : "text-emerald-300"}`}>{l.statusCode}</td>
                <td className="td text-slate-400">{l.ip ?? ""}</td><td className="td">{l.durationMs}</td>
              </tr>))}</tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead><tr><th className="th">Time</th><th className="th">Action</th><th className="th">OK</th><th className="th">HTTP</th><th className="th">ms</th><th className="th">Response</th></tr></thead>
            <tbody>{rows.map((l) => (
              <tr key={l.id} className="border-t border-white/5">
                <td className="td">{new Date(l.createdAt).toLocaleString()}</td><td className="td">{l.action}</td>
                <td className="td">{l.ok ? "✅" : "❌"}</td><td className="td">{l.statusCode}</td><td className="td">{l.latencyMs}</td>
                <td className="td max-w-sm truncate text-slate-400">{l.response}</td>
              </tr>))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
