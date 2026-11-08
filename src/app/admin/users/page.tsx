"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import Modal from "@/components/Modal";

const tone: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-300", INACTIVE: "bg-slate-500/20 text-slate-300", SUSPENDED: "bg-rose-500/15 text-rose-300",
};
const ago = (d?: string | null) => (d ? new Date(d).toLocaleString() : "—");

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [create, setCreate] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [bal, setBal] = useState<any>(null);
  const [f, setF] = useState<any>({});

  const load = useCallback(() => api<any[]>("/api/admin/users").then(setUsers).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);

  async function run(fn: () => Promise<any>, ok?: (r: any) => void) {
    setErr("");
    try { const r = await fn(); ok?.(r); await load(); return true; } catch (e: any) { setErr(e.message); return false; }
  }

  const createUser = () => run(
    () => api("/api/admin/users", { body: { username: f.username, password: f.password, balance: f.balance, status: f.status } }),
    (r) => { setNotice(`User "${r.username}" created. API key (shown once): ${r.apiKey}`); setCreate(false); setF({}); }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Users ({users.length})</h2>
        <button className="btn" onClick={() => { setF({ status: "ACTIVE" }); setCreate(true); }}>+ Create user</button>
      </div>
      {err && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{err}</p>}
      {notice && <p className="break-all rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{notice}</p>}

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead><tr><th className="th">User</th><th className="th">Role</th><th className="th">Status</th><th className="th">Balance</th><th className="th">Key</th><th className="th">Last activity</th><th className="th">Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-white/5">
                <td className="td font-medium">{u.username}</td>
                <td className="td">{u.role}</td>
                <td className="td"><span className={`badge ${tone[u.status]}`}>{u.status}</span></td>
                <td className="td">{Number(u.balance).toFixed(2)}</td>
                <td className="td font-mono text-xs text-slate-400">{u.apiKeyPrefix}…</td>
                <td className="td text-slate-400">{ago(u.lastActivityAt)}</td>
                <td className="td">
                  <div className="flex gap-1.5">
                    <button className="btn-ghost" onClick={() => { setBal(u); setF({ amount: "", note: "" }); }}>Balance</button>
                    <button className="btn-ghost" onClick={() => { setEdit(u); setF({ username: u.username, password: "", status: u.status }); }}>Edit</button>
                    {u.role !== "ADMIN" && (
                      <>
                        <button className="btn-ghost" onClick={() => run(() => api(`/api/admin/users/${u.id}`, { method: "PATCH", body: { status: u.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED" } }))}>
                          {u.status === "SUSPENDED" ? "Unsuspend" : "Suspend"}
                        </button>
                        <button className="btn-danger" onClick={() => confirm(`Delete ${u.username}? This can't be undone.`) && run(() => api(`/api/admin/users/${u.id}`, { method: "DELETE" }))}>Delete</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {create && (
        <Modal title="Create user" onClose={() => setCreate(false)}>
          <div className="space-y-3">
            <div><label className="label">Username</label><input className="input" value={f.username ?? ""} onChange={(e) => setF({ ...f, username: e.target.value })} /></div>
            <div><label className="label">Password (min 6)</label><input className="input" type="text" value={f.password ?? ""} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
            <div><label className="label">Starting balance</label><input className="input" type="number" min="0" step="0.01" value={f.balance ?? ""} onChange={(e) => setF({ ...f, balance: e.target.value })} /></div>
            <div><label className="label">Status</label>
              <select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
                <option>ACTIVE</option><option>INACTIVE</option><option>SUSPENDED</option>
              </select></div>
            <button className="btn w-full" onClick={createUser}>Create</button>
          </div>
        </Modal>
      )}

      {edit && (
        <Modal title={`Edit ${edit.username}`} onClose={() => setEdit(null)}>
          <div className="space-y-3">
            <div><label className="label">Username</label><input className="input" value={f.username ?? ""} onChange={(e) => setF({ ...f, username: e.target.value })} /></div>
            <div><label className="label">New password (leave empty to keep)</label><input className="input" value={f.password ?? ""} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
            <div><label className="label">Status</label>
              <select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
                <option>ACTIVE</option><option>INACTIVE</option><option>SUSPENDED</option>
              </select></div>
            <button className="btn w-full" onClick={async () => {
              const body: any = { username: f.username, status: f.status };
              if (f.password) body.password = f.password;
              if (await run(() => api(`/api/admin/users/${edit.id}`, { method: "PATCH", body }))) setEdit(null);
            }}>Save</button>
            <button className="btn-ghost w-full" onClick={async () => {
              if (!confirm("Regenerate this user's API key?")) return;
              await run(() => api(`/api/admin/users/${edit.id}`, { method: "PATCH", body: { regenerateKey: true } }),
                (r) => { setNotice(`New API key for ${edit.username} (shown once): ${r.apiKey}`); setEdit(null); });
            }}>Regenerate API key</button>
          </div>
        </Modal>
      )}

      {bal && (
        <Modal title={`Balance — ${bal.username} (${Number(bal.balance).toFixed(2)})`} onClose={() => setBal(null)}>
          <div className="space-y-3">
            <div><label className="label">Amount (negative to deduct)</label><input className="input" type="number" step="0.01" value={f.amount ?? ""} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
            <div><label className="label">Note (optional)</label><input className="input" value={f.note ?? ""} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
            <button className="btn w-full" onClick={async () => {
              if (await run(() => api("/api/admin/balance", { body: { userId: bal.id, amount: f.amount, note: f.note } }))) setBal(null);
            }}>Apply</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
