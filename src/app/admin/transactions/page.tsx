"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";

export default function Transactions() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState("");
  useEffect(() => { api<any[]>("/api/admin/transactions").then(setRows).catch((e) => setErr(e.message)); }, []);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Transactions (last 200)</h2>
      {err && <p className="text-sm text-rose-300">{err}</p>}
      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead><tr><th className="th">Date</th><th className="th">User</th><th className="th">Type</th><th className="th">Amount</th><th className="th">Balance after</th><th className="th">Note</th></tr></thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-white/5">
                <td className="td">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="td">{t.user?.username}</td><td className="td">{t.type}</td>
                <td className={`td font-medium ${t.amount < 0 ? "text-rose-300" : "text-emerald-300"}`}>{Number(t.amount).toFixed(4)}</td>
                <td className="td">{Number(t.balanceAfter).toFixed(2)}</td><td className="td text-slate-400">{t.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
