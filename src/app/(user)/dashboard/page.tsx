"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SERVICES, COUNTRIES, flag, serviceName, countryOf } from "@/lib/catalog";
import { api } from "@/lib/client";

type Act = {
  id: string; phone: string; service: string; country: string; status: string;
  smsCode: string | null; expiresAt: string; price: number;
};
const CUR = "$";

function Countdown({ to }: { to: string }) {
  const [left, setLeft] = useState(() => Math.max(0, new Date(to).getTime() - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, new Date(to).getTime() - Date.now())), 1000);
    return () => clearInterval(t);
  }, [to]);
  const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
  return <span className={left < 60000 ? "text-rose-400" : "text-amber-300"}>{m}:{String(s).padStart(2, "0")}</span>;
}

export default function Dashboard() {
  const [service, setService] = useState("wa");
  const [country, setCountry] = useState("0");
  const [q, setQ] = useState("");
  const [price, setPrice] = useState<number | null | undefined>(undefined);
  const [balance, setBalance] = useState<number | null>(null);
  const [acts, setActs] = useState<Act[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const actsRef = useRef<Act[]>([]);
  actsRef.current = acts;

  const refreshMe = useCallback(async () => {
    try { setBalance((await api<{ balance: number }>("/api/me")).balance); } catch {}
  }, []);

  useEffect(() => {
    refreshMe();
    api<Act[]>("/api/numbers/list?active=1").then(setActs).catch(() => {});
  }, [refreshMe]);

  useEffect(() => {
    setPrice(undefined);
    api<{ price: number | null }>(`/api/catalog/price?service=${service}&country=${country}`)
      .then((r) => setPrice(r.price)).catch(() => setPrice(null));
  }, [service, country]);

  // متابعة الارقام المنتظرة كل 4 ثواني
  useEffect(() => {
    const t = setInterval(async () => {
      const waiting = actsRef.current.filter((a) => a.status === "WAITING");
      if (!waiting.length) return;
      const res = await Promise.all(waiting.map((a) => api<Act>(`/api/numbers/status?id=${a.id}`).catch(() => null)));
      let changed = false;
      setActs((prev) =>
        prev.flatMap((a) => {
          const n = res.find((r) => r && r.id === a.id);
          if (!n) return [a];
          if (n.status !== a.status) changed = true;
          if (n.status === "EXPIRED" || n.status === "CANCELLED") {
            setNotice(`${n.phone} expired — refunded to your balance.`);
            return [];
          }
          return [{ ...a, ...n }];
        })
      );
      setTimeout(() => changed && refreshMe(), 300);
    }, 4000);
    return () => clearInterval(t);
  }, [refreshMe]);

  const countries = useMemo(
    () => COUNTRIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  async function buy() {
    setBusy(true); setErr(""); setNotice("");
    try {
      const a = await api<Act>("/api/numbers/buy", { body: { service, country } });
      setActs((p) => [a, ...p]);
      refreshMe();
    } catch (e: any) { setErr(e.message); }
    setBusy(false);
  }

  async function cancel(id: string) {
    setErr("");
    try {
      await api("/api/numbers/cancel", { body: { id } });
      setActs((p) => p.filter((a) => a.id !== id));
      setNotice("Cancelled — your balance was refunded.");
      refreshMe();
    } catch (e: any) { setErr(e.message); }
  }

  async function finish(id: string) {
    try {
      await api("/api/numbers/complete", { body: { id } });
      setActs((p) => p.filter((a) => a.id !== id));
    } catch (e: any) { setErr(e.message); }
  }

  const copy = (t: string) => navigator.clipboard?.writeText(t);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="card space-y-5 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Buy a number</h2>
          <div className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-300">
            {balance === null ? "…" : `${CUR}${balance.toFixed(2)}`}
          </div>
        </div>

        <div>
          <label className="label">Service</label>
          <div className="grid grid-cols-3 gap-2">
            {SERVICES.map((s) => (
              <button key={s.code} onClick={() => setService(s.code)}
                className={`rounded-xl border px-2 py-2 text-xs font-medium transition ${service === s.code ? "border-indigo-400 bg-indigo-500/20 text-white" : "border-white/10 text-slate-300 hover:bg-white/5"}`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Country</label>
          <input className="input mb-2" placeholder="Search country…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-white/10 p-1">
            {countries.map((c) => (
              <button key={c.id} onClick={() => setCountry(c.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${country === c.id ? "bg-indigo-500/25" : "hover:bg-white/5"}`}>
                <span className="text-lg">{flag(c.iso)}</span>{c.name}
              </button>
            ))}
            {!countries.length && <p className="p-3 text-sm text-slate-500">No match</p>}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
          <span className="text-slate-400">Price</span>
          <span className="font-semibold">
            {price === undefined ? "…" : price === null ? "Unavailable" : `${CUR}${price}`}
          </span>
        </div>

        {err && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{err}</p>}
        {notice && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{notice}</p>}
        <button className="btn w-full" onClick={buy} disabled={busy || price === null || price === undefined}>
          {busy ? "Buying…" : "Buy number"}
        </button>
      </section>

      <section className="space-y-4 lg:col-span-3">
        <h2 className="text-lg font-semibold">Active numbers</h2>
        {!acts.length && (
          <div className="card text-center text-sm text-slate-500">No active numbers. Pick a service and country, then buy.</div>
        )}
        {acts.map((a) => {
          const c = countryOf(a.country);
          return (
            <div key={a.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400">{serviceName(a.service)} · {c ? `${flag(c.iso)} ${c.name}` : a.country}</div>
                  <button onClick={() => copy(a.phone)} title="Copy" className="mt-1 text-2xl font-bold tracking-wide hover:text-indigo-300">
                    +{a.phone.replace(/^\+/, "")}
                  </button>
                </div>
                {a.status === "WAITING" && (
                  <div className="text-right text-sm">
                    <div className="text-xs text-slate-400">Time left</div>
                    <div className="text-xl font-semibold"><Countdown to={a.expiresAt} /></div>
                  </div>
                )}
              </div>

              {a.status === "WAITING" ? (
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" /> Waiting for SMS…
                  </span>
                  <button className="btn-danger" onClick={() => cancel(a.id)}>Cancel / Refund</button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-4 py-3">
                  <button onClick={() => a.smsCode && copy(a.smsCode)} title="Copy"
                    className="text-3xl font-bold tracking-widest text-emerald-300">{a.smsCode}</button>
                  <button className="btn-ghost" onClick={() => finish(a.id)}>Done</button>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
