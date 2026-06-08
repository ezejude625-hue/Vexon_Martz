"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_BADGE = {
  delivered:  "bg-emerald-100 text-emerald-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-amber-100 text-amber-700",
  pending:    "bg-gray-100 text-gray-600",
  cancelled:  "bg-red-100 text-red-700",
  refunded:   "bg-red-100 text-red-700",
};

function Spark({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-8 mt-3">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all"
          style={{ height: `${(v / max) * 100}%`, background: i === data.length - 1 ? color : `${color}55`, minWidth: "4px" }} />
      ))}
    </div>
  );
}

const QUICK_LINKS = [
  { icon: "add_box",      label: "Add Product",      href: "/admin/products",  color: "#003F47" },
  { icon: "local_offer",  label: "Create Coupon",    href: "/admin/coupons",   color: "#7C3AED" },
  { icon: "storefront",   label: "Manage Vendors",   href: "/admin/vendors",   color: "#E8A355" },
  { icon: "support_agent",label: "Support Tickets",  href: "/admin/support",   color: "#ef4444" },
  { icon: "bar_chart",    label: "Analytics",        href: "/admin/analytics", color: "#0ea5e9" },
  { icon: "receipt_long", label: "Finance",          href: "/admin/finance",   color: "#059669" },
  { icon: "people",       label: "Customers",        href: "/admin/customers", color: "#ec4899" },
  { icon: "summarize",    label: "Reports",          href: "/admin/reports",   color: "#6B7D8A" },
];

export default function AdminDashboard() {
  const [stats,     setStats]     = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [sRes, aRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/analytics"),
      ]);
      const [s, a] = await Promise.all([sRes.json(), aRes.json()]);
      if (s.success) setStats(s.data);
      if (a.success) setAnalytics(a.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Build KPI cards from real DB data
  const KPI_CARDS = stats ? [
    {
      icon: "payments",    label: "Revenue",        color: "#003F47", bg: "rgba(0,63,71,0.08)",
      value: formatCurrency(stats.total_revenue || 0),
      change: stats.revenue_change || 0,
      spark: (analytics?.monthly || []).map(m => m.revenue),
      href: "/admin/finance",
    },
    {
      icon: "receipt_long", label: "Orders",        color: "#7C3AED", bg: "rgba(124,58,237,0.08)",
      value: (stats.total_orders || 0).toLocaleString(),
      change: stats.orders_change || 0,
      spark: (analytics?.monthly || []).map(m => m.orders),
      href: "/admin/orders",
    },
    {
      icon: "group",       label: "Customers",      color: "#059669", bg: "rgba(5,150,105,0.08)",
      value: (stats.total_customers || 0).toLocaleString(),
      change: stats.customers_change || 0,
      spark: (analytics?.monthly || []).map(m => m.customers),
      href: "/admin/customers",
    },
    {
      icon: "inventory_2", label: "Active Products", color: "#E8A355", bg: "rgba(232,163,85,0.10)",
      value: (stats.total_products || 0).toLocaleString(),
      change: null,
      spark: [1,1,1,1,1,1,1].map(() => stats.total_products || 1),
      href: "/admin/products",
    },
  ] : [];

  const chartMonths  = (analytics?.monthly || []).map(m => m.label);
  const chartRevenue = (analytics?.monthly || []).map(m => m.revenue);
  const maxR = Math.max(...chartRevenue, 1);

  const topProducts = analytics?.topProducts || [];

  return (
    <div className="space-y-6">
      {/* Header banner — unchanged VexonMart style */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{ background: "linear-gradient(135deg,#003F47 0%,#1C3040 60%,#003F47 100%)" }}>
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full border border-white/6" />
        <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full border border-white/8" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,rgba(255,189,118,0.8),transparent 70%)", filter: "blur(20px)" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.12em] mb-1">Admin Dashboard</p>
            <h1 className="text-white text-2xl md:text-3xl" style={{ fontFamily: "'Roboto Slab',sans-serif", fontWeight: 800, letterSpacing: "-0.025em" }}>
              VexonMart Admin
            </h1>
            <p className="text-white/45 text-sm mt-1.5">
              {loading ? "Loading stats…" : stats?.pending_orders > 0
                ? `${stats.pending_orders} order${stats.pending_orders !== 1 ? "s" : ""} awaiting fulfilment`
                : "All caught up — no pending orders"}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/admin/products" className="btn-primary text-sm h-9 px-4 gap-1.5">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Product
            </Link>
            <Link href="/admin/orders"
              className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span className="hidden sm:block">Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI cards — real data */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse" style={{ border: "1px solid #EDE3D2" }}>
              <div className="w-10 h-10 rounded-xl bg-wheat mb-4" />
              <div className="h-7 bg-wheat rounded w-2/3 mb-2" />
              <div className="h-3 bg-wheat rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CARDS.map(k => (
            <Link key={k.label} href={k.href}
              className="bg-white rounded-2xl p-5 block transition-all duration-200"
              style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 10px rgba(10,23,29,0.06)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(10,23,29,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(10,23,29,0.06)"; }}>
              <div className="flex items-center justify-between mb-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ color: k.color, fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
                </div>
                {k.change !== null && (
                  <span className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${k.change >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                    <span className="material-symbols-outlined text-[13px]">{k.change >= 0 ? "trending_up" : "trending_down"}</span>
                    {Math.abs(k.change)}%
                  </span>
                )}
              </div>
              {k.spark.length > 0 && <Spark data={k.spark} color={k.color} />}
              <p className="text-2xl font-black text-onyx tabular-nums mt-2"
                style={{ fontFamily: "'Roboto Slab',sans-serif", letterSpacing: "-0.02em" }}>
                {k.value}
              </p>
              <p className="text-xs font-semibold text-onyx/40 mt-0.5 uppercase tracking-[0.06em]">{k.label}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Revenue chart (real) + Top Products (real) */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 bg-white rounded-2xl p-6" style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 10px rgba(10,23,29,0.05)" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-onyx" style={{ fontFamily: "'Roboto Slab',sans-serif" }}>Revenue Overview</h2>
              <p className="text-onyx/40 text-xs mt-0.5">Last 6 months</p>
            </div>
            <div className="flex gap-4 text-xs text-onyx/40">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-oceanic inline-block" />Revenue</span>
            </div>
          </div>
          {loading ? (
            <div className="flex items-end gap-3 h-40 animate-pulse">
              {[60,80,45,90,70,100].map((h,i) => (
                <div key={i} className="flex-1 rounded-t-lg bg-wheat" style={{ height: `${h}%` }} />
              ))}
            </div>
          ) : (
            <div className="flex items-end gap-3" style={{ height: "160px" }}>
              {chartMonths.map((m, i) => (
                <div key={m} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="w-full flex items-end" style={{ height: "130px" }}>
                    <div className="w-full rounded-t-lg hover:opacity-80 transition-all cursor-pointer relative"
                      style={{ height: `${(chartRevenue[i] / maxR) * 100}%`, background: "linear-gradient(180deg,#003F47,#005566)", minHeight: "6px" }}
                      title={formatCurrency(chartRevenue[i])}>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-onyx text-wheat text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                        {formatCurrency(chartRevenue[i])}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-onyx/40 font-medium">{m}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl p-6" style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 10px rgba(10,23,29,0.05)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-onyx" style={{ fontFamily: "'Roboto Slab',sans-serif" }}>Top Products</h2>
            <Link href="/admin/products" className="text-xs text-oceanic font-semibold hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-wheat rounded animate-pulse" />)}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-onyx/35 text-sm text-center py-8">No products yet</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, i) => {
                const maxSales = topProducts[0]?.totalSales || 1;
                const pct = Math.round((p.totalSales / maxSales) * 100);
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[13px] font-medium text-onyx/80 line-clamp-1 flex-1 pr-2">{p.name}</p>
                      <span className="text-[12px] font-bold text-onyx shrink-0">{p.totalSales} sold</span>
                    </div>
                    <div className="h-1.5 bg-wheat-dark rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: "linear-gradient(90deg,#003F47,#007A8F)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick links — unchanged */}
      <div>
        <h2 className="font-bold text-onyx mb-3" style={{ fontFamily: "'Roboto Slab',sans-serif" }}>Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map(q => (
            <Link key={q.href} href={q.href}
              className="group flex items-center gap-3 p-4 bg-white rounded-2xl transition-all duration-200"
              style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 8px rgba(10,23,29,0.05)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(10,23,29,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(10,23,29,0.05)"; }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${q.color}12` }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: q.color }}>{q.icon}</span>
              </div>
              <span className="text-sm font-semibold text-onyx/70 group-hover:text-onyx transition-colors">{q.label}</span>
              <span className="material-symbols-outlined text-[16px] text-onyx/20 group-hover:text-onyx/50 ml-auto transition-all group-hover:translate-x-0.5">arrow_forward</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent orders — real data */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 12px rgba(10,23,29,0.06)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#EDE3D2" }}>
          <div>
            <h2 className="font-bold text-onyx text-base" style={{ fontFamily: "'Roboto Slab',sans-serif" }}>Recent Orders</h2>
            <p className="text-onyx/40 text-xs mt-0.5">Latest transactions</p>
          </div>
          <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-oceanic hover:underline">
            View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
        {loading ? (
          <div className="py-10 text-center">
            <span className="material-symbols-outlined text-4xl text-onyx/15 animate-spin block mb-2">progress_activity</span>
            <p className="text-onyx/35 text-sm">Loading orders…</p>
          </div>
        ) : !stats?.recent_orders?.length ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-onyx/12 block mb-3">receipt_long</span>
            <p className="font-semibold text-onyx/35 text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#FAF4EC", borderBottom: "1px solid #EDE3D2" }}>
                  {["Order ID","Customer","Date","Items","Amount","Status",""].map((h, i) => (
                    <th key={h} className={`px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] ${i === 6 ? "text-right" : "text-left"}`} style={{ color: "#6B7D8A" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#F2EAE0" }}>
                {stats.recent_orders.map(order => {
                  const sc = STATUS_BADGE[order.status] || "bg-gray-100 text-gray-600";
                  const c  = order.user || {};
                  const ic = (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0);
                  return (
                    <tr key={order.id} className="transition-colors duration-150"
                      onMouseEnter={e => e.currentTarget.style.background = "#FAF4EC"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-oceanic">#{order.orderNumber?.slice(-8)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-oceanic/10 flex items-center justify-center text-oceanic font-bold text-xs shrink-0">
                            {c.firstName?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-onyx text-sm">{c.firstName} {c.lastName}</p>
                            <p className="text-[11px] text-onyx/35">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-onyx/50 text-sm whitespace-nowrap">{formatDate(order.createdAt, { month: "short", day: "numeric" })}</td>
                      <td className="px-6 py-4 text-onyx/55">{ic} item{ic !== 1 ? "s" : ""}</td>
                      <td className="px-6 py-4 font-bold text-onyx tabular-nums">{formatCurrency(parseFloat(order.totalAmount || 0))}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${sc}`}>{order.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/orders/${order.id}`} className="text-xs font-bold text-oceanic hover:underline">View →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
