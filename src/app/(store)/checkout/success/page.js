"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

function SuccessContent() {
  const params = useSearchParams();
  const orderNum = params.get("order") || "";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNum) {
      setLoading(false);
      return;
    }
    // Fetch real order from DB
    fetch(`/api/orders/${orderNum}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrder(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderNum]);

  const STEPS = [
    {
      icon: "mail",
      text: "Order confirmation will be emailed to you",
      done: true,
    },
    {
      icon: "inventory_2",
      text: "Seller is preparing your items",
      done: false,
    },
    {
      icon: "local_shipping",
      text: "Tracking number sent once shipped",
      done: false,
    },
    {
      icon: "check_circle",
      text: "Estimated delivery in 3–5 business days",
      done: false,
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-wheat flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-oceanic/30 animate-spin">
          progress_activity
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-wheat flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        {/* Success icon */}
        <div className="text-center mb-10">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-36 h-36 rounded-full bg-emerald-100 animate-ping opacity-30" />
            <div className="absolute w-28 h-28 rounded-full bg-emerald-100" />
            <div
              className="relative w-24 h-24 rounded-3xl bg-white flex items-center justify-center"
              style={{
                border: "2px solid #bbf7d0",
                boxShadow: "0 8px 32px rgba(34,197,94,0.25)",
              }}
            >
              <span
                className="material-symbols-outlined text-emerald-500 text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
          </div>
          <h1
            className="text-onyx mb-2"
            style={{
              fontFamily: "'Roboto Slab',sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.75rem,4vw,2.25rem)",
              letterSpacing: "-0.03em",
            }}
          >
            Order Confirmed!
          </h1>
          <p className="text-onyx/50 text-sm">
            Thank you for shopping with VexonMart. Your order is on its way.
          </p>
        </div>

        {/* Order details card */}
        <div
          className="bg-white rounded-3xl overflow-hidden mb-5"
          style={{
            border: "1px solid #EDE3D2",
            boxShadow: "0 4px 24px rgba(10,23,29,0.08)",
          }}
        >
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg,#003F47,#1C3040)" }}
          >
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.1em]">
                Order Number
              </p>
              <p className="text-white font-mono font-bold text-lg mt-0.5">
                {orderNum}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Paid
            </span>
          </div>

          <div className="divide-y" style={{ borderColor: "#F2EAE0" }}>
            {[
              {
                icon: "calendar_today",
                label: "Order Date",
                val: order
                  ? formatDate(order.createdAt)
                  : formatDate(new Date()),
              },
              {
                icon: "pending_actions",
                label: "Status",
                badge: true,
                badgeText: "Processing",
              },
              {
                icon: "local_shipping",
                label: "Shipping",
                val: "Standard (3–5 days)",
              },
              {
                icon: "payments",
                label: "Payment",
                badge: true,
                badgeText: "Confirmed",
                green: true,
              },
            ].map(({ icon, label, val, badge, badgeText, green }) => (
              <div
                key={label}
                className="flex items-center justify-between px-6 py-3.5"
              >
                <div className="flex items-center gap-2.5 text-sm text-onyx/55">
                  <span className="material-symbols-outlined text-[17px] text-oceanic">
                    {icon}
                  </span>
                  {label}
                </div>
                {badge ? (
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${green ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {badgeText}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-onyx">{val}</span>
                )}
              </div>
            ))}
          </div>

          {/* Real items from DB */}
          {order?.items?.length > 0 && (
            <div
              className="px-6 py-4 border-t"
              style={{ borderColor: "#EDE3D2" }}
            >
              <p className="text-[11px] font-bold text-onyx/35 uppercase tracking-[0.1em] mb-3">
                Items Ordered
              </p>
              <div className="space-y-2.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                        style={{ border: "1px solid #EDE3D2" }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-onyx line-clamp-1">
                        {item.productName}
                      </p>
                      <p className="text-xs text-onyx/40">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-onyx tabular-nums shrink-0">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
              {order.totalAmount && (
                <div
                  className="flex justify-between items-center mt-4 pt-3 border-t"
                  style={{ borderColor: "#EDE3D2" }}
                >
                  <span className="font-bold text-onyx text-sm">
                    Order Total
                  </span>
                  <span
                    className="font-black text-onyx tabular-nums text-lg"
                    style={{ fontFamily: "'Roboto Slab',sans-serif" }}
                  >
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Next steps */}
        <div
          className="bg-white rounded-2xl p-5 mb-5"
          style={{
            border: "1px solid #EDE3D2",
            boxShadow: "0 2px 12px rgba(10,23,29,0.06)",
          }}
        >
          <h3
            className="font-bold text-onyx text-sm mb-4 flex items-center gap-2"
            style={{ fontFamily: "'Roboto Slab',sans-serif" }}
          >
            <span className="material-symbols-outlined text-oceanic text-[18px]">
              timeline
            </span>
            What happens next?
          </h3>
          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: s.done ? "#dcfce7" : "#F5EBD8",
                    border: `1px solid ${s.done ? "#bbf7d0" : "#E2D5C0"}`,
                  }}
                >
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{
                      color: s.done ? "#16a34a" : "#6B7D8A",
                      fontVariationSettings: s.done ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {s.done ? "check_circle" : s.icon}
                  </span>
                </div>
                <p
                  className={`text-sm ${s.done ? "text-onyx font-medium" : "text-onyx/55"}`}
                >
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/orders"
            className="btn-secondary flex-1 justify-center h-12 text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              receipt_long
            </span>
            View My Orders
          </Link>
          <Link
            href="/shop"
            className="btn-primary flex-1 justify-center h-12 text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              storefront
            </span>
            Continue Shopping
          </Link>
        </div>

        <p className="text-center text-xs text-onyx/35 mt-5">
          Need a receipt?{" "}
          <Link
            href={`/orders/${orderNum}/invoice`}
            className="text-oceanic font-semibold hover:underline"
          >
            Download invoice
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-wheat">
          <span className="material-symbols-outlined text-4xl text-oceanic/30 animate-spin">
            progress_activity
          </span>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
