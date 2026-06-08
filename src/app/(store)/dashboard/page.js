"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_DOT = {
  delivered: "#22c55e",
  processing: "#0ea5e9",
  shipped: "#f59e0b",
  pending: "#9ca3af",
  cancelled: "#ef4444",
  refunded: "#ef4444",
};
const STATUS_BADGE = {
  delivered: "bg-emerald-100 text-emerald-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-amber-100 text-amber-700",
  pending: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-red-100 text-red-700",
};

const QUICK_LINKS = [
  {
    icon: "receipt_long",
    label: "Track Orders",
    href: "/dashboard/orders",
    color: "#003F47",
  },
  {
    icon: "local_offer",
    label: "View Deals",
    href: "/shop?filter=sale",
    color: "#E8A355",
  },
  {
    icon: "download",
    label: "Downloads",
    href: "/dashboard/downloads",
    color: "#7C3AED",
  },
  {
    icon: "support_agent",
    label: "Get Help",
    href: "/dashboard/messages",
    color: "#059669",
  },
];

export default function DashboardPage() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState({ item_count: 0 });
  const [loading, setLoading] = useState(true);

  // ── Load all data from DB in parallel ─────────────────────
  const loadAll = useCallback(async () => {
    try {
      const [meRes, ordersRes, wishRes, cartRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/orders"),
        fetch("/api/wishlist"),
        fetch("/api/cart"),
      ]);
      const [meData, ordersData, wishData, cartData] = await Promise.all([
        meRes.json(),
        ordersRes.json(),
        wishRes.json(),
        cartRes.json(),
      ]);
      if (meData.success) setUser(meData.data);
      if (ordersData.success) setOrders(ordersData.data || []);
      if (wishData.success) setWishlist(wishData.data || []);
      if (cartData.success) setCart(cartData.data || { item_count: 0 });
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Re-fetch cart badge when items are added from other pages
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch("/api/cart");
        const data = await res.json();
        if (data.success) setCart(data.data || { item_count: 0 });
      } catch {}
    };
    window.addEventListener("cart:updated", refresh);
    return () => window.removeEventListener("cart:updated", refresh);
  }, []);

  const totalSpent = orders.reduce(
    (s, o) => s + parseFloat(o.totalAmount || 0),
    0,
  );
  const recentOrders = orders.slice(0, 4);

  const STATS = [
    {
      icon: "receipt_long",
      label: "Total Orders",
      value: orders.length.toString(),
      color: "#003F47",
      bg: "rgba(0,63,71,0.07)",
    },
    {
      icon: "payments",
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      color: "#E8A355",
      bg: "rgba(232,163,85,0.10)",
    },
    {
      icon: "favorite",
      label: "Wishlist",
      value: wishlist.length.toString(),
      color: "#ef4444",
      bg: "rgba(239,68,68,0.08)",
    },
    {
      icon: "shopping_cart",
      label: "Cart Items",
      value: (cart.item_count || 0).toString(),
      color: "#7C3AED",
      bg: "rgba(124,58,237,0.08)",
    },
  ];

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
      {/* Greeting banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{
          background:
            "linear-gradient(135deg,#003F47 0%,#1C3040 60%,#003F47 100%)",
        }}
      >
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full border border-white/6" />
        <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full border border-white/8" />
        <div
          className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle,rgba(255,189,118,0.8),transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/45 text-sm font-medium mb-1">
              {greeting},
            </p>
            <h1
              className="text-white text-2xl md:text-3xl leading-tight"
              style={{
                fontFamily: "'Roboto Slab',sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.025em",
              }}
            >
              {user?.firstName || "there"}!
            </h1>
            <p className="text-white/45 text-sm mt-2">
              {orders.length > 0
                ? `You have ${orders.length} order${orders.length !== 1 ? "s" : ""} · last: ${formatDate(orders[0]?.createdAt || new Date())}`
                : "Welcome! Start shopping to see your orders here."}
            </p>
          </div>
          <Link href="/shop" className="btn-primary text-sm shrink-0">
            <span className="material-symbols-outlined text-[18px]">
              storefront
            </span>
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 10px rgba(10,23,29,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: s.bg }}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}
                >
                  {s.icon}
                </span>
              </div>
            </div>
            <p
              className="text-2xl font-black text-onyx tabular-nums"
              style={{
                fontFamily: "'Roboto Slab',sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {s.value}
            </p>
            <p className="text-xs font-semibold text-onyx/40 mt-0.5 uppercase tracking-[0.06em]">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="group flex items-center gap-3 p-4 bg-white rounded-2xl transition-all duration-200"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 8px rgba(10,23,29,0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(10,23,29,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(10,23,29,0.05)";
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${q.color}12` }}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ color: q.color }}
              >
                {q.icon}
              </span>
            </div>
            <span className="text-sm font-semibold text-onyx/70 group-hover:text-onyx transition-colors">
              {q.label}
            </span>
            <span className="material-symbols-outlined text-[16px] text-onyx/20 group-hover:text-onyx/50 ml-auto transition-all duration-200 group-hover:translate-x-0.5">
              arrow_forward
            </span>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: "1px solid #EDE3D2",
          boxShadow: "0 2px 12px rgba(10,23,29,0.06)",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "#EDE3D2" }}
        >
          <div>
            <h2
              className="font-bold text-onyx text-base"
              style={{ fontFamily: "'Roboto Slab',sans-serif" }}
            >
              Recent Orders
            </h2>
            <p className="text-onyx/40 text-xs mt-0.5">Your latest purchases</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-1 text-xs font-semibold text-oceanic hover:underline"
          >
            View all{" "}
            <span className="material-symbols-outlined text-[14px]">
              arrow_forward
            </span>
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y" style={{ borderColor: "#F2EAE0" }}>
            {recentOrders.map((order) => {
              const statusKey = order.status || "processing";
              return (
                <div
                  key={order.orderNumber}
                  className="flex items-center justify-between px-6 py-4 transition-colors duration-150"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#FAF4EC")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: STATUS_DOT[statusKey] || "#9ca3af" }}
                    />
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold text-onyx/60 truncate">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-onyx/40 mt-0.5">
                        {formatDate(order.createdAt, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {order.items?.length > 0 &&
                          ` · ${order.items.reduce((s, i) => s + (i.quantity || 1), 0)} item${order.items.length !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize hidden sm:inline-flex ${STATUS_BADGE[statusKey] || "bg-gray-100 text-gray-600"}`}
                    >
                      {statusKey}
                    </span>
                    <span className="font-bold text-onyx text-sm tabular-nums">
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                    <Link
                      href={`/orders/${order.orderNumber}/invoice`}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-onyx/30 hover:text-oceanic hover:bg-oceanic/8 transition-all duration-150"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        receipt
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-onyx/15 block mb-3">
              shopping_bag
            </span>
            <p className="font-semibold text-onyx/35 text-sm">No orders yet</p>
            <p className="text-xs text-onyx/25 mt-1 mb-5">
              Your orders will appear here after checkout
            </p>
            <Link href="/shop" className="btn-primary text-sm inline-flex">
              <span className="material-symbols-outlined text-[18px]">
                storefront
              </span>
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
