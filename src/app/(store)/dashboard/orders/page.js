"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CONFIG = {
  delivered: {
    badge: "bg-emerald-100 text-emerald-700",
    dot: "#22c55e",
    icon: "check_circle",
    label: "Delivered",
  },
  processing: {
    badge: "bg-blue-100 text-blue-700",
    dot: "#0ea5e9",
    icon: "pending",
    label: "Processing",
  },
  shipped: {
    badge: "bg-amber-100 text-amber-700",
    dot: "#f59e0b",
    icon: "local_shipping",
    label: "Shipped",
  },
  pending: {
    badge: "bg-gray-100 text-gray-600",
    dot: "#9ca3af",
    icon: "schedule",
    label: "Pending",
  },
  refunded: {
    badge: "bg-red-100 text-red-700",
    dot: "#ef4444",
    icon: "currency_exchange",
    label: "Refunded",
  },
  cancelled: {
    badge: "bg-red-100 text-red-700",
    dot: "#ef4444",
    icon: "cancel",
    label: "Cancelled",
  },
};

const FILTER_TABS = [
  "all",
  "processing",
  "shipped",
  "delivered",
  "pending",
  "refunded",
  "cancelled",
];

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  // ── Load orders from DB ───────────────────────────────────
  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) setOrders(data.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = orders.filter((o) => {
    const matchF = filter === "all" || o.status === filter;
    const matchS =
      !search ||
      (o.orderNumber || "").toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <span className="material-symbols-outlined text-4xl text-onyx/20 animate-spin">
          progress_activity
        </span>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-black text-onyx tracking-tight"
            style={{
              fontFamily: "'Roboto Slab',sans-serif",
              letterSpacing: "-0.025em",
            }}
          >
            My Orders
          </h1>
          <p className="text-onyx/45 text-sm mt-0.5">
            {filtered.length} order{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Link
          href="/shop"
          className="btn-primary text-sm h-9 px-4 gap-1.5 hidden sm:inline-flex"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>New
          Order
        </Link>
      </div>

      <div
        className="bg-white rounded-2xl p-4"
        style={{
          border: "1px solid #EDE3D2",
          boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-wrap gap-1.5">
            {FILTER_TABS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all duration-150"
                style={{
                  background: filter === f ? "#003F47" : "#F5EBD8",
                  color: filter === f ? "#FFF6E9" : "#6B7D8A",
                  boxShadow: filter === f ? "0 2px 8px rgba(0,63,71,0.25)" : "",
                }}
              >
                {f}
                {f !== "all" &&
                  orders.filter((o) => o.status === f).length > 0 && (
                    <span className="ml-1.5 opacity-60">
                      {orders.filter((o) => o.status === f).length}
                    </span>
                  )}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[180px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-onyx/30 text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID…"
              className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "#F5EBD8",
                border: "1.5px solid transparent",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#003F47";
                e.target.style.boxShadow = "0 0 0 3px rgba(0,63,71,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "transparent";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="bg-white rounded-2xl py-20 text-center"
          style={{ border: "1px solid #EDE3D2" }}
        >
          <span className="material-symbols-outlined text-6xl text-onyx/12 block mb-3">
            receipt_long
          </span>
          <p className="font-semibold text-onyx/35">
            {orders.length === 0
              ? "You haven't placed any orders yet"
              : "No orders match your filter"}
          </p>
          <p className="text-sm text-onyx/25 mt-1 mb-6">
            {orders.length === 0
              ? "Your orders will appear here after checkout"
              : "Try changing the filter"}
          </p>
          {orders.length === 0 && (
            <Link href="/shop" className="btn-primary text-sm">
              <span className="material-symbols-outlined text-[18px]">
                storefront
              </span>
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const statusKey = order.status || "processing";
            const s = STATUS_CONFIG[statusKey] || STATUS_CONFIG.processing;
            const isOpen = expanded === order.orderNumber;
            const orderNum = order.orderNumber || "N/A";
            // DB returns quantity on each item
            const itemCount = (order.items || []).reduce(
              (sum, i) => sum + (i.quantity || 1),
              0,
            );

            return (
              <div
                key={orderNum}
                className="bg-white rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  border: "1px solid #EDE3D2",
                  boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
                }}
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        background: `${s.dot}14`,
                        border: `1px solid ${s.dot}25`,
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{
                          color: s.dot,
                          fontVariationSettings: "'FILL' 1",
                        }}
                      >
                        {s.icon}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-mono font-semibold text-sm text-onyx">
                          {orderNum}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${s.badge}`}
                        >
                          {s.label}
                        </span>
                      </div>
                      <p className="text-xs text-onyx/40">
                        {order.createdAt
                          ? formatDate(order.createdAt, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Just now"}
                        {itemCount > 0 &&
                          ` · ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:shrink-0">
                    <span
                      className="font-black text-onyx tabular-nums text-lg"
                      style={{
                        fontFamily: "'Roboto Slab',sans-serif",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpanded(isOpen ? null : orderNum)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                        style={{
                          background: "rgba(0,63,71,0.08)",
                          color: "#003F47",
                          border: "1px solid rgba(0,63,71,0.15)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#003F47";
                          e.currentTarget.style.color = "#FFF6E9";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(0,63,71,0.08)";
                          e.currentTarget.style.color = "#003F47";
                        }}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isOpen ? "expand_less" : "expand_more"}
                        </span>
                        Details
                      </button>
                      <Link
                        href={`/orders/${orderNum}/invoice`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-onyx/55 hover:text-onyx transition-all duration-150"
                        style={{ border: "1px solid #E2D5C0" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#003F47";
                          e.currentTarget.style.background = "#F5EBD8";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#E2D5C0";
                          e.currentTarget.style.background = "";
                        }}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          receipt
                        </span>
                        Invoice
                      </Link>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div
                    className="border-t px-5 pb-5 pt-4 animate-scale-in"
                    style={{ borderColor: "#EDE3D2", background: "#FAF4EC" }}
                  >
                    {order.items?.length > 0 ? (
                      <>
                        <p className="text-[11px] font-bold text-onyx/35 uppercase tracking-[0.1em] mb-3">
                          Items
                        </p>
                        <div className="space-y-2.5">
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 bg-white rounded-xl p-3"
                              style={{ border: "1px solid #EDE3D2" }}
                            >
                              {item.productImage && (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                                  style={{ border: "1px solid #EDE3D2" }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-onyx text-sm line-clamp-1">
                                  {item.productName}
                                </p>
                                <p className="text-xs text-onyx/40 mt-0.5">
                                  {formatCurrency(item.unitPrice)} ×{" "}
                                  {item.quantity}
                                </p>
                              </div>
                              <span className="font-bold text-onyx text-sm tabular-nums shrink-0">
                                {formatCurrency(item.totalPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 space-y-1.5 text-sm">
                          {[
                            { l: "Subtotal", v: order.subtotal },
                            {
                              l: "Shipping",
                              v: order.shippingAmount,
                              free: parseFloat(order.shippingAmount || 0) === 0,
                            },
                            { l: "Tax (7.5%)", v: order.taxAmount },
                          ].map(({ l, v, free }) => (
                            <div key={l} className="flex justify-between">
                              <span className="text-onyx/45">{l}</span>
                              <span
                                className={`font-medium tabular-nums ${free ? "text-emerald-600" : ""}`}
                              >
                                {free ? "FREE" : formatCurrency(v || 0)}
                              </span>
                            </div>
                          ))}
                          <div
                            className="flex justify-between font-bold text-onyx pt-2 border-t"
                            style={{ borderColor: "#EDE3D2" }}
                          >
                            <span>Total</span>
                            <span className="tabular-nums">
                              {formatCurrency(order.totalAmount || 0)}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-onyx/35 text-center py-4">
                        No item details available
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
