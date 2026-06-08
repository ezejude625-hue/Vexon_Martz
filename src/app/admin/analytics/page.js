"use client";
import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";

// Traffic sources are not in DB — keep as illustrative placeholder
const TOP_SOURCES = [
  { src: "Organic Search", pct: 42, color: "#003F47" },
  { src: "Direct",         pct: 28, color: "#FFBD76" },
  { src: "Social Media",   pct: 18, color: "#7C3AED" },
  { src: "Email",          pct:  8, color: "#059669" },
  { src: "Paid Ads",       pct:  4, color: "#ef4444" },
];

export default function AdminAnalyticsPage() {
  const [range,     setRange]     = useState("6");
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/analytics?months=${range}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {}
    setLoading(false);
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const monthly    = data?.monthly    || [];
  const topProducts= data?.topProducts|| [];
  const categories = data?.categories || [];
  const maxVisits  = Math.max(...monthly.map(m => m.orders), 1);
  const maxRev     = Math.max(...monthly.map(m => m.revenue), 1);

  const totalOrders   = monthly.reduce((s, m) => s + m.orders,   0);
  const totalRevenue  = monthly.reduce((s, m) => s + m.revenue,  0);
  const totalCustomers= monthly.reduce((s, m) => s + m.customers,0);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-onyx" style={{ fontFamily: "Roboto Slab,sans-serif", letterSpacing: "-0.025em" }}>Analytics</h1>
          <p className="text-onyx/45 text-sm mt-0.5">Real-time store performance metrics</p>
        </div>
        <div className="flex gap-1.5">
          {[["3","3 months"],["6","6 months"],["12","12 months"]].map(([v,l]) => (
            <button key={v} onClick={() => setRange(v)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: range===v?"#003F47":"#fff", color: range===v?"#FFF6E9":"#6B7D8A", border: `1px solid ${range===v?"transparent":"#E2D5C0"}` }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Total Revenue",   v: loading ? "—" : formatCurrency(totalRevenue),           i: "payments",   c: "#003F47" },
          { l: "Total Orders",    v: loading ? "—" : totalOrders.toLocaleString(),            i: "receipt_long",c: "#7C3AED" },
          { l: "New Customers",   v: loading ? "—" : totalCustomers.toLocaleString(),         i: "group",      c: "#059669" },
          { l: "Active Products", v: loading ? "—" : (data?.topProducts?.length||0)+" tracked",i: "inventory_2",c:"#E8A355" },
        ].map(k => (
          <div key={k.l} className="bg-white rounded-2xl p-5" style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 10px rgba(10,23,29,0.05)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.c}12` }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: k.c, fontVariationSettings: "'FILL' 1" }}>{k.i}</span>
              </div>
            </div>
            <p className="text-2xl font-black text-onyx tabular-nums" style={{ fontFamily: "Roboto Slab,sans-serif" }}>{k.v}</p>
            <p className="text-[11px] text-onyx/40 font-semibold uppercase tracking-[0.06em] mt-0.5">{k.l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Orders + Revenue dual chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6" style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 10px rgba(10,23,29,0.05)" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-onyx" style={{ fontFamily: "Roboto Slab,sans-serif" }}>Orders & Revenue</h2>
            <div className="flex gap-4 text-xs text-onyx/40">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-oceanic inline-block" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:"#E8A355"}} />Orders</span>
            </div>
          </div>
          {loading ? (
            <div className="flex items-end gap-2.5 h-40 animate-pulse">
              {[60,80,45,90,70,100].map((h,i) => <div key={i} className="flex-1 rounded-t-lg bg-wheat" style={{ height: `${h}%` }} />)}
            </div>
          ) : (
            <div className="flex items-end gap-2.5" style={{ height: "160px" }}>
              {monthly.map(({ label, revenue, orders }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end gap-0.5" style={{ height: "130px" }}>
                    <div className="flex-1 rounded-lg hover:opacity-80 transition-all cursor-pointer group relative"
                      style={{ height: `${(revenue / maxRev) * 100}%`, background: "linear-gradient(180deg,#003F47,#005566)", minHeight: "4px" }}
                      title={formatCurrency(revenue)}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-onyx text-wheat text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                        {formatCurrency(revenue)}
                      </div>
                    </div>
                    <div className="flex-1 rounded-lg transition-all duration-700"
                      style={{ height: `${(orders / maxVisits) * 70}%`, background: "linear-gradient(180deg,#E8A355,#FFBD76)", minHeight: "3px" }} />
                  </div>
                  <p className="text-[11px] text-onyx/40 font-medium">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Traffic sources — illustrative */}
        <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 10px rgba(10,23,29,0.05)" }}>
          <h2 className="font-bold text-onyx mb-5" style={{ fontFamily: "Roboto Slab,sans-serif" }}>Traffic Sources</h2>
          <div className="space-y-4">
            {TOP_SOURCES.map(s => (
              <div key={s.src}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="font-medium text-onyx">{s.src}</span>
                  <span className="font-bold text-onyx w-8 text-right">{s.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "#EDE3D2" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products from DB */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 10px rgba(10,23,29,0.05)" }}>
          <div className="px-6 py-4 border-b font-bold text-onyx" style={{ borderColor: "#EDE3D2", fontFamily: "Roboto Slab,sans-serif" }}>
            Top Products by Sales
          </div>
          {loading ? (
            <div className="p-6 space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-wheat rounded animate-pulse" />)}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#FAF4EC", borderBottom: "1px solid #EDE3D2" }}>
                  {["Product","Sales","Rating","Price"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: "#6B7D8A" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#F2EAE0" }}>
                {topProducts.map(p => (
                  <tr key={p.id} className="transition-colors duration-150"
                    onMouseEnter={e => e.currentTarget.style.background = "#FAF4EC"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <td className="px-5 py-3.5 font-medium text-onyx/80 max-w-[180px] truncate">{p.name}</td>
                    <td className="px-5 py-3.5 font-bold text-oceanic tabular-nums">{(p.totalSales||0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-onyx/55">{parseFloat(p.avgRating||0).toFixed(1)} ★</td>
                    <td className="px-5 py-3.5 font-semibold text-onyx tabular-nums">{formatCurrency(parseFloat(p.price||0))}</td>
                  </tr>
                ))}
                {!topProducts.length && <tr><td colSpan={4} className="px-5 py-10 text-center text-onyx/35 text-sm">No products yet</td></tr>}
              </tbody>
            </table>
          )}
        </div>

        {/* Categories breakdown from DB */}
        <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 10px rgba(10,23,29,0.05)" }}>
          <h2 className="font-bold text-onyx mb-5" style={{ fontFamily: "Roboto Slab,sans-serif" }}>Products by Category</h2>
          {loading ? (
            <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-8 bg-wheat rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-4">
              {categories.map(cat => {
                const maxCat = Math.max(...categories.map(c => c._count?.products || 0), 1);
                const pct = Math.round(((cat._count?.products || 0) / maxCat) * 100);
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[13px] font-medium text-onyx/80">{cat.name}</p>
                      <span className="text-[12px] font-bold text-onyx">{cat._count?.products || 0} products</span>
                    </div>
                    <div className="h-1.5 bg-wheat-dark rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#E8A355,#FFBD76)" }} />
                    </div>
                  </div>
                );
              })}
              {!categories.length && <p className="text-onyx/35 text-sm text-center py-6">No categories yet</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
