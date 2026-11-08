"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

export default function Login() {
  const router = useRouter();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await api<{ role: string }>("/api/auth/login", { body: { username, password } });
      router.push(r.role === "ADMIN" ? "/admin" : "/dashboard");
      router.refresh();
    } catch (e: any) {
      setErr(e.message); setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-7">
        <div className="text-center">
          <h1 className="text-2xl font-bold"><span className="text-indigo-400">SMS</span> Panel</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to your account</p>
        </div>
        <div>
          <label className="label">Username</label>
          <input className="input" value={username} onChange={(e) => setU(e.target.value)} autoComplete="username" autoFocus />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
        </div>
        {err && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{err}</p>}
        <button className="btn w-full" disabled={busy || !username || !password}>{busy ? "Signing in…" : "Sign in"}</button>
        <p className="text-center text-xs text-slate-500">Accounts are created by the administrator only.</p>
      </form>
    </main>
  );
}
