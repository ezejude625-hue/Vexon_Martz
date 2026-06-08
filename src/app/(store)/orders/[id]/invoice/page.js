"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoicePage({ params }) {
  const orderId = params?.id || "";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    // Fetch from DB — same route used by checkout success
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) setOrder(data.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  function handlePrint() {
    window.print();
  }

  if (loading)
    return (
      <div className="min-h-screen bg-wheat flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-oceanic/30 animate-spin">
          progress_activity
        </span>
      </div>
    );

  if (notFound)
    return (
      <div className="min-h-screen bg-wheat flex items-center justify-center text-center px-4">
        <div>
          <span className="material-symbols-outlined text-6xl text-onyx/12 block mb-3">
            receipt_long
          </span>
          <p className="font-bold text-onyx/40 text-lg mb-4">Order not found</p>
          <Link href="/dashboard/orders" className="btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    );

  // Map DB fields → display values
  const o = order;
  const items = o.items || [];
  const itemCount = items.reduce((s, i) => s + (i.quantity || 1), 0);
  const subtotal = parseFloat(o.subtotal || 0);
  const tax = parseFloat(o.taxAmount || 0);
  const shipping = parseFloat(o.shippingAmount || 0);
  const discount = parseFloat(o.discountAmount || 0);
  const total = parseFloat(o.totalAmount || 0);

  // Delivery info comes from the Address relation
  const addr = o.address || {};
  // Email was stored in notes as JSON
  const deliveryEmail = (() => {
    try {
      return JSON.parse(o.notes || "{}").deliveryEmail || "";
    } catch {
      return "";
    }
  })();

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-card, #invoice-card * { visibility: visible !important; }
          #invoice-card { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; margin: 0 !important; padding: 24px !important; box-shadow: none !important; border: none !important; border-radius: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-wheat py-10 px-4">
        {/* Controls */}
        <div className="max-w-3xl mx-auto flex items-center justify-between mb-6 no-print">
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-2 text-sm font-semibold text-onyx/60 hover:text-onyx transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to Orders
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="btn-ghost h-9 px-4 text-sm gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">
                print
              </span>
              Print
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary h-9 px-4 text-sm gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">
                download
              </span>
              Save as PDF
            </button>
          </div>
        </div>

        {/* Invoice card */}
        <div
          id="invoice-card"
          className="max-w-3xl mx-auto bg-white rounded-3xl overflow-hidden"
          style={{
            border: "1px solid #EDE3D2",
            boxShadow: "0 8px 48px rgba(10,23,29,0.12)",
          }}
        >
          {/* Header */}
          <div
            className="relative overflow-hidden px-10 py-8"
            style={{
              background:
                "linear-gradient(135deg,#0A171D 0%,#1C3040 50%,#003F47 100%)",
            }}
          >
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border border-white/5" />
            <div className="absolute -right-6  -top-6  w-32 h-32 rounded-full border border-white/8" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-nectarine/15 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-nectarine text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      storefront
                    </span>
                  </div>
                  <span
                    className="text-white font-black text-xl tracking-tight"
                    style={{
                      fontFamily: "'Roboto Slab',sans-serif",
                      fontWeight: 800,
                    }}
                  >
                    Vexon<span className="text-nectarine">Mart</span>
                  </span>
                </div>
                <p className="text-white/30 text-xs">
                  Shop Smarter. Live Better.
                </p>
                <p className="text-white/30 text-xs mt-0.5">
                  support@vexonmart.com
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.12em] mb-1.5">
                  Invoice
                </p>
                <p className="text-white font-mono font-bold text-xl">
                  {o.orderNumber}
                </p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    PAID
                  </span>
                </div>
                <p className="text-white/30 text-xs mt-2">
                  {formatDate(o.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-10 py-8">
            {/* Bill to + Details */}
            <div
              className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b"
              style={{ borderColor: "#EDE3D2" }}
            >
              <div>
                <p className="text-[10px] font-bold text-onyx/35 uppercase tracking-[0.12em] mb-3">
                  Bill To
                </p>
                <p className="font-bold text-onyx text-base">
                  {addr.fullName || "Customer"}
                </p>
                {deliveryEmail && (
                  <p className="text-sm text-onyx/55 mt-1">{deliveryEmail}</p>
                )}
                {addr.phone && (
                  <p className="text-sm text-onyx/55">{addr.phone}</p>
                )}
                {addr.street && (
                  <p className="text-sm text-onyx/55 mt-1.5">{addr.street}</p>
                )}
                {(addr.city || addr.country) && (
                  <p className="text-sm text-onyx/55">
                    {[addr.city, addr.state, addr.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-onyx/35 uppercase tracking-[0.12em] mb-3">
                  Details
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Invoice Date", val: formatDate(o.createdAt) },
                    {
                      label: "Items",
                      val: `${itemCount} item${itemCount !== 1 ? "s" : ""}`,
                    },
                    {
                      label: "Method",
                      val:
                        o.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : o.paymentMethod === "paypal"
                            ? "PayPal"
                            : "Card (Stripe)",
                    },
                    { label: "Status", val: "Paid" },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-onyx/40">{label}</span>
                      <span className="font-semibold text-onyx">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="mb-8">
              <div
                className="grid grid-cols-12 gap-4 px-4 py-3 rounded-xl mb-2 text-[10px] font-bold text-onyx/35 uppercase tracking-[0.1em]"
                style={{ background: "#F5EBD8" }}
              >
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.length > 0 ? (
                <div className="divide-y" style={{ borderColor: "#F2EAE0" }}>
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-4 px-4 py-4 items-center"
                    >
                      <div className="col-span-6">
                        <p className="font-semibold text-onyx text-sm">
                          {item.productName}
                        </p>
                      </div>
                      <div className="col-span-2 text-center text-sm text-onyx/55 font-medium">
                        {item.quantity}
                      </div>
                      <div className="col-span-2 text-right text-sm text-onyx/55 tabular-nums">
                        {formatCurrency(item.unitPrice)}
                      </div>
                      <div className="col-span-2 text-right text-sm font-bold text-onyx tabular-nums">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-onyx/30 text-sm">
                  No items
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-72 space-y-2.5">
                {[
                  {
                    label: "Subtotal",
                    val: formatCurrency(subtotal),
                    green: false,
                  },
                  {
                    label: "Tax (7.5%)",
                    val: formatCurrency(tax),
                    green: false,
                  },
                  {
                    label: "Shipping",
                    val: shipping === 0 ? "FREE" : formatCurrency(shipping),
                    green: shipping === 0,
                  },
                  ...(discount > 0
                    ? [
                        {
                          label: "Discount",
                          val: `-${formatCurrency(discount)}`,
                          green: true,
                        },
                      ]
                    : []),
                ].map(({ label, val, green }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center text-sm py-1 border-b"
                    style={{ borderColor: "#F2EAE0" }}
                  >
                    <span className="text-onyx/50">{label}</span>
                    <span
                      className={`font-semibold tabular-nums ${green ? "text-emerald-600" : "text-onyx"}`}
                    >
                      {val}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3">
                  <span className="font-bold text-onyx text-base">
                    Total Due
                  </span>
                  <span
                    className="font-black text-onyx tabular-nums"
                    style={{
                      fontFamily: "'Roboto Slab',sans-serif",
                      fontSize: "1.5rem",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment confirmed */}
            <div
              className="mt-8 p-5 rounded-2xl flex items-start gap-4"
              style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-emerald-600 text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
              <div>
                <p className="font-bold text-emerald-800 text-sm">
                  Payment Successfully Received
                </p>
                <p className="text-emerald-700/70 text-xs mt-0.5 leading-relaxed">
                  This invoice is your official payment receipt for order{" "}
                  <strong>{o.orderNumber}</strong>. Transaction was processed
                  securely.
                </p>
              </div>
            </div>

            <div
              className="mt-8 pt-6 border-t text-center"
              style={{ borderColor: "#EDE3D2" }}
            >
              <p className="text-xs text-onyx/30">
                Questions? Contact{" "}
                <a
                  href="mailto:support@vexonmart.com"
                  className="text-oceanic hover:underline font-medium"
                >
                  support@vexonmart.com
                </a>{" "}
                · VexonMart © {new Date().getFullYear()} · Shop Smarter. Live
                Better.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
