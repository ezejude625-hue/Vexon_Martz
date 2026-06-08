"use client";
// ============================================================
// CART PAGE — src/app/(store)/cart/page.js
// ============================================================

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState(null); // { type:'success'|'error', text }

  // ── Read cart from DB ─────────────────────────────────────
  const loadCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      if (data.success) setItems(data.data?.items || []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // ── Update quantity — writes to DB ────────────────────────
  async function updateQty(product_id, qty) {
    if (qty < 1) return remove(product_id);
    await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id, quantity: qty }),
    });
    await loadCart();
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }

  // ── Remove item — deletes from DB ─────────────────────────
  async function remove(product_id) {
    await fetch(`/api/cart?product_id=${product_id}`, { method: "DELETE" });
    await loadCart();
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }

  // ── Clear all items — deletes each from DB ────────────────
  async function clearCart() {
    await Promise.all(
      items.map((i) =>
        fetch(`/api/cart?product_id=${i.product_id}`, { method: "DELETE" }),
      ),
    );
    setDiscount(0);
    setCouponMsg(null);
    await loadCart();
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }

  // ── Coupon — calls /api/coupons ───────────────────────────
  async function applyCoupon() {
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupon.trim().toUpperCase(),
          cart_total: subtotal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscount(data.data.discount_amount);
        setCouponMsg({ type: "success", text: "Coupon applied!" });
      } else {
        setDiscount(0);
        setCouponMsg({
          type: "error",
          text: data.message || "Invalid or expired coupon code.",
        });
      }
    } catch {
      setCouponMsg({
        type: "error",
        text: "Could not apply coupon. Try again.",
      });
    }
  }

  // ── Totals ────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : subtotal === 0 ? 0 : 9.99;
  const tax = (subtotal - discount) * 0.075;
  const total = Math.max(0, subtotal - discount + tax + shipping);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  function goCheckout() {
    router.push("/checkout");
  }

  if (loading)
    return (
      <div className="min-h-screen bg-wheat flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-oceanic/30 animate-spin">
          progress_activity
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-wheat py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-black text-onyx"
              style={{
                fontFamily: "'Roboto Slab',sans-serif",
                letterSpacing: "-0.025em",
              }}
            >
              Your Cart
            </h1>
            <p className="text-onyx/45 text-sm mt-0.5">
              {itemCount > 0
                ? `${itemCount} item${itemCount !== 1 ? "s" : ""}`
                : "Your cart is empty"}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-400 hover:text-red-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                delete_sweep
              </span>
              Clear cart
            </button>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div
            className="bg-white rounded-3xl py-24 text-center"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 16px rgba(10,23,29,0.06)",
            }}
          >
            <div
              className="w-24 h-24 rounded-3xl bg-wheat flex items-center justify-center mx-auto mb-5"
              style={{ border: "1px solid #EDE3D2" }}
            >
              <span className="material-symbols-outlined text-5xl text-onyx/15">
                shopping_cart
              </span>
            </div>
            <h2
              className="font-black text-onyx/35 text-xl mb-2"
              style={{ fontFamily: "'Roboto Slab',sans-serif" }}
            >
              Nothing here yet
            </h2>
            <p className="text-onyx/30 text-sm mb-8">
              Add some products and they will show up here
            </p>
            <Link href="/shop" className="btn-primary">
              <span className="material-symbols-outlined text-[18px]">
                storefront
              </span>
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Cart items (left / top) ─────────────────── */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="bg-white rounded-2xl p-4 flex gap-4 transition-all duration-200"
                  style={{
                    border: "1px solid #EDE3D2",
                    boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
                  }}
                >
                  {/* Product image */}
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-wheat"
                    style={{ border: "1px solid #EDE3D2" }}
                  >
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-onyx/15">
                          image
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {item.category && (
                        <p className="text-[10px] font-bold text-oceanic/55 uppercase tracking-[0.08em] mb-0.5">
                          {item.category}
                        </p>
                      )}
                      <p className="font-semibold text-onyx text-sm leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      <p className="font-black text-oceanic tabular-nums mt-1">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    {/* Qty + remove — responsive row */}
                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      {/* Quantity control */}
                      <div
                        className="flex items-center gap-1 rounded-xl overflow-hidden"
                        style={{ border: "1.5px solid #E2D5C0" }}
                      >
                        <button
                          onClick={() =>
                            updateQty(item.product_id, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center text-onyx/50 hover:bg-wheat hover:text-onyx transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            remove
                          </span>
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-onyx select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQty(item.product_id, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center text-onyx/50 hover:bg-wheat hover:text-onyx transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            add
                          </span>
                        </button>
                      </div>

                      {/* Line total + remove */}
                      <div className="flex items-center gap-3">
                        <span className="font-black text-onyx tabular-nums text-sm">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => remove(item.product_id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-onyx/25 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue shopping */}
              <Link
                href="/shop"
                className="flex items-center gap-2 text-sm font-semibold text-oceanic hover:text-onyx transition-colors py-2 w-fit"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                Continue Shopping
              </Link>
            </div>

            {/* ── Order summary (right / bottom) ──────────── */}
            <div className="space-y-4">
              {/* Coupon */}
              <div
                className="bg-white rounded-2xl p-5"
                style={{
                  border: "1px solid #EDE3D2",
                  boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
                }}
              >
                <p
                  className="font-bold text-onyx text-sm mb-3 flex items-center gap-2"
                  style={{ fontFamily: "'Roboto Slab',sans-serif" }}
                >
                  <span className="material-symbols-outlined text-oceanic text-[17px]">
                    local_offer
                  </span>
                  Coupon Code
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    placeholder="Enter coupon code"
                    className="flex-1 h-10 px-3 rounded-xl text-sm font-mono outline-none transition-all"
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
                  <button
                    onClick={applyCoupon}
                    className="h-10 px-4 rounded-xl text-xs font-bold text-white transition-all"
                    style={{ background: "#003F47" }}
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <p
                    className={`text-xs font-semibold mt-2 flex items-center gap-1 ${couponMsg.type === "success" ? "text-emerald-600" : "text-red-500"}`}
                  >
                    <span className="material-symbols-outlined text-[14px] material-symbols-filled">
                      {couponMsg.type === "success" ? "check_circle" : "cancel"}
                    </span>
                    {couponMsg.text}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div
                className="bg-white rounded-2xl p-5"
                style={{
                  border: "1px solid #EDE3D2",
                  boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
                }}
              >
                <p
                  className="font-bold text-onyx text-sm mb-4 flex items-center gap-2"
                  style={{ fontFamily: "'Roboto Slab',sans-serif" }}
                >
                  <span className="material-symbols-outlined text-oceanic text-[17px]">
                    receipt_long
                  </span>
                  Order Summary
                </p>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-onyx/50">
                      Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                    </span>
                    <span className="font-semibold text-onyx tabular-nums">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-emerald-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">
                          local_offer
                        </span>
                        Discount
                      </span>
                      <span className="font-semibold text-emerald-600 tabular-nums">
                        -{formatCurrency(discount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-onyx/50">Tax (7.5%)</span>
                    <span className="font-semibold text-onyx tabular-nums">
                      {formatCurrency(tax)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-onyx/50 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">
                        local_shipping
                      </span>
                      Shipping
                    </span>
                    <span
                      className={`font-semibold tabular-nums ${shipping === 0 ? "text-emerald-600" : "text-onyx"}`}
                    >
                      {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <p className="text-[11px] text-onyx/35 bg-wheat rounded-xl px-3 py-2">
                      Add {formatCurrency(100 - subtotal)} more for free
                      shipping
                      <span className="ml-1 font-bold">
                        ({Math.round((subtotal / 100) * 100)}% there)
                      </span>
                    </p>
                  )}
                </div>

                {/* Free shipping progress bar */}
                {subtotal < 100 && subtotal > 0 && (
                  <div className="mt-3">
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "#EDE3D2" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (subtotal / 100) * 100)}%`,
                          background: "linear-gradient(90deg,#003F47,#007A8F)",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div
                  className="border-t mt-4 pt-4"
                  style={{ borderColor: "#EDE3D2" }}
                >
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-onyx">Total</span>
                    <span
                      className="font-black text-onyx text-2xl tabular-nums"
                      style={{
                        fontFamily: "'Roboto Slab',sans-serif",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={goCheckout}
                  className="btn-primary w-full justify-center h-12 mt-4 text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    lock
                  </span>
                  Proceed to Checkout
                </button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-4 text-onyx/30">
                  {[
                    { i: "verified_user", t: "Secure" },
                    { i: "replay", t: "Returns" },
                    { i: "support_agent", t: "Support" },
                  ].map((b) => (
                    <div
                      key={b.t}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {b.i}
                      </span>
                      <span className="text-[10px] font-semibold">{b.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
