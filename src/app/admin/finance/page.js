"use client";
import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

const TYPE_BADGE = {
  paid:      "bg-emerald-100 text-emerald-700",
  unpaid:    "bg-gray-100 text-gray-600",
  refunded:  "bg-red-100 text-red-700",
  partially_refunded: "bg-amber-100 text-amber-700",
};

export default function AdminFinancePage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [range,   setRange]   = useState("30d");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/finance?range=${range}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {}
    setLoading(false);
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const chart  = data?.monthly_chart || [];
  const maxR   = Math.max(...chart.map(c => c.r), 1);
  const maxE   = Math.max(...chart.map(c => c.e), 1);

  const SUMMARY_CARDS = [
    { l: "Gross Revenue",   v: data?.gross          || 0, i: "payments",          c: "#003F47" },
    { l: "Net Revenue",     v: data?.net            || 0, i: "account_balance",    c: "#059669" },
    { l: "Refunds",         v: data?.refunds        || 0, i: "currency_exchange",  c: "#ef4444" },
    { l: "Platform Fees",   v: data?.fees           || 0, i: "percent",            c: "#7C3AED" },
    { l: "Total Expenses",  v: data?.expenses       || 0, i: "receipt",            c: "#E8A355" },
    { l: "Pending Payout",  v: data?.pending_payout || 0, i: "schedule_send",      c: "#0ea5e9" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-onyx" style={{ fontFamily: "Roboto Slab,sans-serif", letterSpacing: "-0.025em" }}>Finance</h1>
          <p className="text-onyx/45 text-sm mt-0.5">Revenue, expenses and payouts</p>
        </div>
        <div className="flex gap-1.5">
          {["7d","30d","90d","1y"].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: range===r?"#003F47":"#fff", color: range===r?"#FFF6E9":"#6B7D8A", border: `1px solid ${range===r?"transparent":"#E2D5C0"}` }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-2xl p-5 h-28 animate-pulse" style={{ border: "1px solid #EDE3D2" }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {SUMMARY_CARDS.map(k => (
            <div key={k.l} className="bg-white rounded-2xl p-5" style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 10px rgba(10,23,29,0.05)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.c}12` }}>
                  <span className="material-symbols-outlined text-[18px]" style={{ color: k.c, fontVariationSettings: "'FILL' 1" }}>{k.i}</span>
                </div>
                <p className="text-[11px] font-bold text-onyx/40 uppercase tracking-[0.06em]">{k.l}</p>
              </div>
              <p className="text-2xl font-black text-onyx tabular-nums" style={{ fontFamily: "Roboto Slab,sans-serif" }}>
                {formatCurrency(k.v)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue vs Expenses chart */}
      <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 10px rgba(10,23,29,0.05)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-onyx" style={{ fontFamily: "Roboto Slab,sans-serif" }}>Revenue vs Expenses</h2>
            <p className="text-onyx/40 text-xs mt-0.5">Last 6 months</p>
          </div>
          <div className="flex gap-4 text-xs text-onyx/40">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-oceanic inline-block" />Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:"#E8A355"}} />Expenses</span>
          </div>
        </div>
        {loading ? (
          <div className="flex items-end gap-3 h-40 animate-pulse">
            {[60,80,45,90,70,100].map((h,i) => <div key={i} className="flex-1 rounded-t-lg bg-wheat" style={{ height: `${h}%` }} />)}
          </div>
        ) : (
          <div className="flex items-end gap-3" style={{ height: "160px" }}>
            {chart.map(({ m, r, e }) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end gap-1" style={{ height: "130px" }}>
                  <div className="flex-1 rounded-t-lg hover:opacity-80 transition-all cursor-pointer relative group"
                    style={{ height: `${(r / maxR) * 100}%`, background: "linear-gradient(180deg,#003F47,#005566)", minHeight: "4px" }}
                    title={formatCurrency(r)}>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-onyx text-wheat text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                      {formatCurrency(r)}
                    </span>
                  </div>
                  <div className="flex-1 rounded-t-lg hover:opacity-80 transition-all cursor-pointer relative group"
                    style={{ height: `${(e / maxR) * 100}%`, background: "linear-gradient(180deg,#E8A355,#FFBD76)", minHeight: "3px" }}
                    title={formatCurrency(e)}>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-onyx text-wheat text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                      {formatCurrency(e)}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-onyx/40 font-medium">{m}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real transactions from DB */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 12px rgba(10,23,29,0.06)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#EDE3D2" }}>
          <div>
            <h2 className="font-bold text-onyx" style={{ fontFamily: "Roboto Slab,sans-serif" }}>Recent Transactions</h2>
            <p className="text-onyx/40 text-xs mt-0.5">From database</p>
          </div>
          <a href="/api/admin/reports?type=sales" target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold text-oceanic hover:underline">
            <span className="material-symbols-outlined text-[15px]">download</span>
            Export CSV
          </a>
        </div>
        {loading ? (
          <div className="py-10 text-center">
            <span className="material-symbols-outlined text-4xl text-onyx/15 animate-spin block mb-2">progress_activity</span>
            <p className="text-onyx/35 text-sm">Loading transactions…</p>
          </div>
        ) : !data?.transactions?.length ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-onyx/12 block mb-3">receipt</span>
            <p className="font-semibold text-onyx/35 text-sm">No transactions in this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#FAF4EC", borderBottom: "1px solid #EDE3D2" }}>
                  {["Order","Customer","Amount","Payment","Status","Date"].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: "#6B7D8A" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#F2EAE0" }}>
                {data.transactions.map(t => (
                  <tr key={t.id} className="transition-colors duration-150"
                    onMouseEnter={e => e.currentTarget.style.background = "#FAF4EC"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <td className="px-6 py-3.5 font-mono text-xs font-semibold text-oceanic">#{t.orderNumber?.slice(-8)}</td>
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-onyx text-sm">{t.user?.firstName} {t.user?.lastName}</p>
                      <p className="text-[11px] text-onyx/35">{t.user?.email}</p>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-onyx tabular-nums">{formatCurrency(parseFloat(t.totalAmount||0))}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${TYPE_BADGE[t.paymentStatus]||"bg-gray-100 text-gray-600"}`}>
                        {t.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-medium text-onyx/60 capitalize">{t.status}</span>
                    </td>
                    <td className="px-6 py-3.5 text-onyx/50 text-sm whitespace-nowrap">
                      {formatDate(t.createdAt, { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
