"use client";
import { useState } from "react";
import { formatDate } from "@/lib/utils";

const REPORT_TYPES = [
  {
    id:      "sales",
    icon:    "payments",
    label:   "Sales Report",
    desc:    "All orders, revenue, and payment status",
    color:   "#003F47",
    bg:      "rgba(0,63,71,0.08)",
  },
  {
    id:      "customers",
    icon:    "group",
    label:   "Customer Report",
    desc:    "All registered customers with order count",
    color:   "#059669",
    bg:      "rgba(5,150,105,0.08)",
  },
  {
    id:      "products",
    icon:    "inventory_2",
    label:   "Products Report",
    desc:    "Full product catalogue with sales & ratings",
    color:   "#7C3AED",
    bg:      "rgba(124,58,237,0.08)",
  },
  {
    id:      "inventory",
    icon:    "warehouse",
    label:   "Inventory Report",
    desc:    "Current stock levels and product status",
    color:   "#E8A355",
    bg:      "rgba(232,163,85,0.10)",
  },
  {
    id:      "taxes",
    icon:    "receipt_long",
    label:   "Tax Report",
    desc:    "Estimated tax collected per order",
    color:   "#ef4444",
    bg:      "rgba(239,68,68,0.08)",
  },
  {
    id:      "marketing",
    icon:    "local_offer",
    label:   "Coupons Report",
    desc:    "Coupon usage, discounts given",
    color:   "#ec4899",
    bg:      "rgba(236,72,153,0.08)",
  },
];

const today   = new Date().toISOString().slice(0, 10);
const ago90   = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export default function AdminReportsPage() {
  const [from,      setFrom]      = useState(ago90);
  const [to,        setTo]        = useState(today);
  const [loading,   setLoading]   = useState(null); // which report is downloading

  async function download(type) {
    setLoading(type);
    try {
      const url    = `/api/admin/reports?type=${type}&from=${from}&to=${to}`;
      const res    = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      const blob   = await res.blob();
      const a      = document.createElement("a");
      a.href       = URL.createObjectURL(blob);
      a.download   = `${type}-report-${today}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert("Could not generate report. Please try again.");
    }
    setLoading(null);
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-black text-onyx" style={{ fontFamily:"Roboto Slab,sans-serif", letterSpacing:"-0.025em" }}>Reports</h1>
        <p className="text-onyx/45 text-sm mt-0.5">Download CSV exports from your live database</p>
      </div>

      {/* Date range */}
      <div className="bg-white rounded-2xl p-5 flex flex-wrap items-end gap-4" style={{ border:"1px solid #EDE3D2", boxShadow:"0 2px 10px rgba(10,23,29,0.05)" }}>
        <div className="flex-1 min-w-[140px]">
          <label className="label">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="input-field" style={{ height:"42px" }} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="label">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="input-field" style={{ height:"42px" }} />
        </div>
        <div className="flex gap-2 shrink-0">
          {[
            ["7d",  7],
            ["30d", 30],
            ["90d", 90],
            ["1y",  365],
          ].map(([l, d]) => (
            <button key={l}
              onClick={() => {
                const t = new Date().toISOString().slice(0,10);
                const f = new Date(Date.now() - d * 86400000).toISOString().slice(0,10);
                setFrom(f); setTo(t);
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ border:"1px solid #E2D5C0", color:"#6B7D8A", background:"#FAF4EC" }}
              onMouseEnter={e => { e.currentTarget.style.background="#003F47"; e.currentTarget.style.color="#FFF6E9"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#FAF4EC"; e.currentTarget.style.color="#6B7D8A"; }}>
              {l}
            </button>
          ))}
        </div>
        <div className="text-sm text-onyx/40 shrink-0">
          {from} → {to}
        </div>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORT_TYPES.map(r => {
          const isLoading = loading === r.id;
          return (
            <div key={r.id} className="bg-white rounded-2xl p-5 flex flex-col gap-4"
              style={{ border:"1px solid #EDE3D2", boxShadow:"0 2px 10px rgba(10,23,29,0.05)" }}>
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background:r.bg }}>
                  <span className="material-symbols-outlined text-[22px]"
                    style={{ color:r.color, fontVariationSettings:"'FILL' 1" }}>{r.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-onyx">{r.label}</p>
                  <p className="text-[12px] text-onyx/45 mt-0.5">{r.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor:"#EDE3D2" }}>
                <span className="text-[11px] text-onyx/35 font-mono">CSV export</span>
                <button onClick={() => download(r.id)} disabled={!!loading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: isLoading ? r.color : "transparent",
                    color:      isLoading ? "#fff"   : r.color,
                    border:     `1px solid ${r.color}40`,
                    opacity:    (loading && !isLoading) ? 0.5 : 1,
                  }}>
                  {isLoading ? (
                    <><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> Downloading…</>
                  ) : (
                    <><span className="material-symbols-outlined text-[14px]">download</span> Download</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background:"rgba(0,63,71,0.06)", border:"1px solid rgba(0,63,71,0.12)" }}>
        <span className="material-symbols-outlined text-oceanic text-[20px] shrink-0 mt-0.5">info</span>
        <div>
          <p className="font-semibold text-oceanic text-sm">All reports are generated from live database data</p>
          <p className="text-[12px] text-onyx/50 mt-0.5">
            Large exports may take a few seconds to generate. Files open directly in Excel, Google Sheets, or any CSV viewer.
          </p>
        </div>
      </div>
    </div>
  );
}
