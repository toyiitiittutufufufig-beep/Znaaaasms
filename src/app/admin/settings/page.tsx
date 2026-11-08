"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";

export default function Settings() {
  const [s, setS] = useState({ autoDeleteInactive: false, inactiveDays: 7 });
  const [msg, setMsg] = useState("");
  useEffect(() => { api<any>("/api/admin/settings").then(setS).catch((e) => setMsg(e.message)); }, []);
  async function save() {
    try { await api("/api/admin/settings", { body: s }); setMsg("Saved ✅"); } catch (e: any) { setMsg(e.message); }
  }
  return (
    <div className="card max-w-lg space-y-5">
      <h2 className="text-lg font-semibold">Settings</h2>
      <label className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium">Auto-delete inactive accounts</div>
          <div className="text-xs text-slate-400">Deletes users with no login and no API requests for the period below. Admins are never deleted.</div>
        </div>
        <input type="checkbox" className="h-5 w-5" checked={s.autoDeleteInactive} onChange={(e) => setS({ ...s, autoDeleteInactive: e.target.checked })} />
      </label>
      <div>
        <label className="label">Inactivity period (days)</label>
        <input className="input" type="number" min={1} max={365} value={s.inactiveDays} onChange={(e) => setS({ ...s, inactiveDays: Number(e.target.value) })} />
      </div>
      <button className="btn" onClick={save}>Save</button>
      {msg && <p className="text-sm text-emerald-300">{msg}</p>}
    </div>
  );
}
