import { db, fmt } from "@/lib/db";
import { getUser } from "@/lib/session";
import { serviceName, countryOf } from "@/lib/catalog";

export const dynamic = "force-dynamic";
const dt = (d: Date) => d.toISOString().slice(0, 16).replace("T", " ") + " UTC";
const tone: Record<string, string> = {
  COMPLETED: "bg-emerald-500/15 text-emerald-300", CODE_RECEIVED: "bg-emerald-500/15 text-emerald-300",
  WAITING: "bg-amber-500/15 text-amber-300", CANCELLED: "bg-slate-500/20 text-slate-300", EXPIRED: "bg-rose-500/15 text-rose-300",
};

export default async function History() {
  const u = (await getUser())!;
  const [acts, txs] = await Promise.all([
    db.activation.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.transaction.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Numbers</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead><tr><th className="th">Date</th><th className="th">Service</th><th className="th">Country</th><th className="th">Number</th><th className="th">Code</th><th className="th">Price</th><th className="th">Status</th></tr></thead>
            <tbody>
              {acts.map((a) => (
                <tr key={a.id} className="border-t border-white/5">
                  <td className="td">{dt(a.createdAt)}</td><td className="td">{serviceName(a.service)}</td>
                  <td className="td">{countryOf(a.country)?.name ?? a.country}</td><td className="td">{a.phone}</td>
                  <td className="td font-mono">{a.smsCode ?? "—"}</td><td className="td">{fmt(a.price)}</td>
                  <td className="td"><span className={`badge ${tone[a.status] ?? ""}`}>{a.status}</span></td>
                </tr>
              ))}
              {!acts.length && <tr><td className="td text-slate-500" colSpan={7}>Nothing yet</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Transactions</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead><tr><th className="th">Date</th><th className="th">Type</th><th className="th">Amount</th><th className="th">Balance after</th><th className="th">Note</th></tr></thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="td">{dt(t.createdAt)}</td><td className="td">{t.type}</td>
                  <td className={`td font-medium ${t.amount < BigInt(0) ? "text-rose-300" : "text-emerald-300"}`}>{fmt(t.amount)}</td>
                  <td className="td">{fmt(t.balanceAfter)}</td><td className="td text-slate-400">{t.note ?? ""}</td>
                </tr>
              ))}
              {!txs.length && <tr><td className="td text-slate-500" colSpan={5}>Nothing yet</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
