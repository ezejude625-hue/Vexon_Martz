"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_STYLES = {
  delivered: {
    badge: "bg-emerald-100 text-emerald-700",
    dot: "#22c55e",
    label: "Delivered",
  },
  processing: {
    badge: "bg-blue-100 text-blue-700",
    dot: "#0ea5e9",
    label: "Processing",
  },
  shipped: {
    badge: "bg-amber-100 text-amber-700",
    dot: "#f59e0b",
    label: "Shipped",
  },
  pending: {
    badge: "bg-gray-100 text-gray-600",
    dot: "#9ca3af",
    label: "Pending",
  },
  cancelled: {
    badge: "bg-red-100 text-red-700",
    dot: "#ef4444",
    label: "Cancelled",
  },
  refunded: {
    badge: "bg-red-100 text-red-700",
    dot: "#ef4444",
    label: "Refunded",
  },
};
const PAYMENT_BADGE = {
  paid: "bg-emerald-100 text-emerald-700",
  unpaid: "bg-amber-100 text-amber-700",
  refunded: "bg-red-100 text-red-700",
};
const TABS = [
  "all",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const AVATAR_COLORS = [
  "#003F47",
  "#7C3AED",
  "#E8A355",
  "#059669",
  "#0ea5e9",
  "#ec4899",
  "#6B7D8A",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (status !== "all") params.set("status", status);
      if (search) params.set("q", search);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
        setTotal(data.pagination?.total || data.data?.length || 0);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [status, search]);

  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black text-onyx"
            style={{ fontFamily: "Syne,sans-serif", letterSpacing: "-0.025em" }}
          >
            Orders
          </h1>
          <p className="text-onyx/45 text-sm mt-0.5">
            {total} orders · {formatCurrency(totalRevenue)} revenue
          </p>
        </div>
        <button
          onClick={() => {
            const csv = [
              "Order,Customer,Email,Date,Amount,Status,Payment",
              ...orders.map(
                (o) =>
                  `${o.orderNumber},${o.user?.firstName} ${o.user?.lastName},${o.user?.email},${o.createdAt},${o.totalAmount},${o.status},${o.paymentStatus}`,
              ),
            ].join("\n");
            const a = document.createElement("a");
            a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
            a.download = "orders.csv";
            a.click();
          }}
          className="btn-primary text-sm gap-2 h-10"
        >
          <span className="material-symbols-outlined text-[16px]">
            download
          </span>
          Export CSV
        </button>
      </div>

      <div
        className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3"
        style={{
          border: "1px solid #EDE3D2",
          boxShadow: "0 2px 8px rgba(10,23,29,0.05)",
        }}
      >
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setStatus(t)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all duration-150"
              style={{
                background: status === t ? "#003F47" : "#F5EBD8",
                color: status === t ? "#FFF6E9" : "#6B7D8A",
                boxShadow: status === t ? "0 2px 8px rgba(0,63,71,0.25)" : "",
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-onyx/30 text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer…"
            className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none"
            style={{ background: "#F5EBD8", border: "1.5px solid transparent" }}
            onFocus={(e) => (e.target.style.borderColor = "#003F47")}
            onBlur={(e) => (e.target.style.borderColor = "transparent")}
          />
        </div>
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: "1px solid #EDE3D2",
          boxShadow: "0 2px 12px rgba(10,23,29,0.06)",
        }}
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-4xl text-onyx/15 animate-spin block mb-2">
                progress_activity
              </span>
              <p className="text-onyx/35 text-sm">Loading orders…</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: "#FAF4EC",
                    borderBottom: "1px solid #EDE3D2",
                  }}
                >
                  {[
                    "Order ID",
                    "Customer",
                    "Items",
                    "Date",
                    "Amount",
                    "Payment",
                    "Status",
                    "",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] ${i === 7 ? "text-right" : "text-left"}`}
                      style={{ color: "#6B7D8A" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#F2EAE0" }}>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <span className="material-symbols-outlined text-5xl text-onyx/12 block mb-2">
                        receipt_long
                      </span>
                      <p className="text-onyx/35 font-semibold">
                        No orders found
                      </p>
                    </td>
                  </tr>
                ) : (
                  orders.map((o, idx) => {
                    const s = STATUS_STYLES[o.status] || STATUS_STYLES.pending;
                    const ac = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                    const c = o.user || {};
                    const payBadge =
                      PAYMENT_BADGE[o.paymentStatus] || PAYMENT_BADGE.unpaid;
                    return (
                      <tr
                        key={o.id}
                        className="transition-colors duration-150"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#FAF4EC")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "")
                        }
                      >
                        <td className="px-5 py-4 font-mono text-xs font-semibold text-oceanic">
                          #{o.orderNumber?.slice(-8)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                              style={{ background: ac + "15", color: ac }}
                            >
                              {c.firstName?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="font-semibold text-onyx text-sm">
                                {c.firstName} {c.lastName}
                              </p>
                              <p className="text-[11px] text-onyx/35">
                                {c.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-onyx/55">
                          {o.items?.length || o._count?.items || 0}
                        </td>
                        <td className="px-5 py-4 text-onyx/45 text-sm whitespace-nowrap">
                          {formatDate(o.createdAt, {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-4 font-bold text-onyx tabular-nums">
                          {formatCurrency(o.totalAmount || 0)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${payBadge}`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: s.dot }}
                            />
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${s.badge}`}
                            >
                              {s.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="text-xs font-bold text-oceanic hover:underline"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
        <div
          className="flex items-center justify-between px-5 py-3.5 border-t"
          style={{ borderColor: "#EDE3D2", background: "#FAF4EC" }}
        >
          <p className="text-xs text-onyx/40">
            Showing {orders.length} of {total}
          </p>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs font-semibold text-oceanic hover:underline"
          >
            <span className="material-symbols-outlined text-[14px]">
              refresh
            </span>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
