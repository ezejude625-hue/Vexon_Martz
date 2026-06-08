"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Delivery", icon: "local_shipping" },
  { n: 2, label: "Payment", icon: "payment" },
  { n: 3, label: "Review", icon: "fact_check" },
];

// Defined outside — stable across renders
function Field({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
        onFocus={(e) => {
          e.target.style.borderColor = "#003F47";
          e.target.style.boxShadow = "0 0 0 3px rgba(0,63,71,0.08)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#E2D5C0";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const [delivery, setDelivery] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    postal: "",
  });
  const [payment, setPayment] = useState({
    method: "card",
    cardNum: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  // ── Load cart from DB + pre-fill user from JWT ─────────────
  const loadData = useCallback(async () => {
    try {
      const [cartRes, meRes] = await Promise.all([
        fetch("/api/cart"),
        fetch("/api/auth/me"),
      ]);
      const [cartData, meData] = await Promise.all([
        cartRes.json(),
        meRes.json(),
      ]);

      if (cartData.success) setItems(cartData.data?.items || []);

      if (meData.success && meData.data) {
        const u = meData.data;
        setDelivery((d) => ({
          ...d,
          fullName: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
          email: u.email || "",
          phone: u.phone || "",
        }));
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Totals ─────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.075;
  const total = subtotal + shipping + tax;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  // ── Place order — hits DB transaction ─────────────────────
  async function placeOrder() {
    setError("");
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method: payment.method,
          delivery_name: delivery.fullName,
          delivery_email: delivery.email,
          delivery_phone: delivery.phone,
          delivery_address: delivery.address,
          delivery_city: delivery.city,
          delivery_state: delivery.state,
          delivery_country: delivery.country,
          delivery_postal: delivery.postal,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Order failed. Please try again.");
        setPlacing(false);
        return;
      }

      // Tell Navbar the cart is now empty
      window.dispatchEvent(new CustomEvent("cart:updated"));
      router.push(`/checkout/success?order=${data.data.order_number}`);
    } catch {
      setError("Network error. Please try again.");
      setPlacing(false);
    }
  }

  function canAdvance() {
    if (step === 1)
      return (
        delivery.fullName &&
        delivery.email &&
        delivery.address &&
        delivery.city &&
        delivery.country
      );
    if (step === 2)
      return (
        payment.method === "cod" ||
        payment.method === "paypal" ||
        (payment.cardNum.length >= 16 && payment.expiry && payment.cvv)
      );
    return true;
  }

  if (loading)
    return (
      <div className="min-h-screen bg-wheat flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-oceanic/30 animate-spin">
          progress_activity
        </span>
      </div>
    );

  if (items.length === 0)
    return (
      <div className="min-h-screen bg-wheat flex items-center justify-center text-center px-4">
        <div>
          <span className="material-symbols-outlined text-6xl text-onyx/12 block mb-3">
            shopping_cart
          </span>
          <p className="font-bold text-onyx/40 text-lg mb-4">
            Your cart is empty
          </p>
          <Link href="/shop" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-wheat py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/cart"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-onyx/50 hover:text-onyx hover:bg-white transition-all"
            style={{ border: "1.5px solid #E2D5C0" }}
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
          </Link>
          <div>
            <h1
              className="text-2xl font-black text-onyx"
              style={{
                fontFamily: "'Roboto Slab',sans-serif",
                letterSpacing: "-0.025em",
              }}
            >
              Checkout
            </h1>
            <p className="text-onyx/45 text-sm mt-0.5">
              {itemCount} item{itemCount !== 1 ? "s" : ""} ·{" "}
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div
          className="flex items-center gap-2 mb-8 bg-white rounded-2xl px-5 py-4"
          style={{
            border: "1px solid #EDE3D2",
            boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
          }}
        >
          {STEPS.map((s, idx) => (
            <div key={s.n} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2.5 shrink-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300"
                  style={{
                    background:
                      step > s.n
                        ? "#22c55e"
                        : step === s.n
                          ? "#003F47"
                          : "#F5EBD8",
                    color:
                      step > s.n
                        ? "#fff"
                        : step === s.n
                          ? "#FFBD76"
                          : "#9AAAB5",
                    boxShadow:
                      step === s.n ? "0 2px 8px rgba(0,63,71,0.3)" : "",
                  }}
                >
                  {step > s.n ? (
                    <span className="material-symbols-outlined text-[14px] material-symbols-filled">
                      check
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[14px]">
                      {s.icon}
                    </span>
                  )}
                </div>
                <span
                  className={`text-sm font-semibold hidden sm:block ${step === s.n ? "text-onyx" : "text-onyx/35"}`}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className="flex-1 h-px mx-2"
                  style={{ background: step > s.n ? "#22c55e" : "#EDE3D2" }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Form panel ──────────────────────────────── */}
          <div className="lg:col-span-2">
            <div
              className="bg-white rounded-2xl p-6"
              style={{
                border: "1px solid #EDE3D2",
                boxShadow: "0 2px 12px rgba(10,23,29,0.06)",
              }}
            >
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2
                    className="font-bold text-onyx text-lg flex items-center gap-2"
                    style={{ fontFamily: "'Roboto Slab',sans-serif" }}
                  >
                    <span className="material-symbols-outlined text-oceanic text-[20px]">
                      local_shipping
                    </span>
                    Delivery Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Full Name *"
                      value={delivery.fullName}
                      onChange={(v) =>
                        setDelivery((d) => ({ ...d, fullName: v }))
                      }
                      placeholder="John Doe"
                    />
                    <Field
                      label="Email *"
                      value={delivery.email}
                      onChange={(v) => setDelivery((d) => ({ ...d, email: v }))}
                      placeholder="john@example.com"
                      type="email"
                    />
                    <Field
                      label="Phone Number"
                      value={delivery.phone}
                      onChange={(v) => setDelivery((d) => ({ ...d, phone: v }))}
                      placeholder="+234 801 234 5678"
                      type="tel"
                    />
                    <div>
                      <label className="label">Country *</label>
                      <select
                        value={delivery.country}
                        onChange={(e) =>
                          setDelivery((d) => ({
                            ...d,
                            country: e.target.value,
                          }))
                        }
                        className="input-field"
                      >
                        {[
                          "Nigeria",
                          "Ghana",
                          "Kenya",
                          "South Africa",
                          "United Kingdom",
                          "United States",
                          "Canada",
                          "Germany",
                          "France",
                          "India",
                          "Brazil",
                          "Australia",
                        ].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <Field
                        label="Street Address *"
                        value={delivery.address}
                        onChange={(v) =>
                          setDelivery((d) => ({ ...d, address: v }))
                        }
                        placeholder="14 Broad Street"
                      />
                    </div>
                    <Field
                      label="City *"
                      value={delivery.city}
                      onChange={(v) => setDelivery((d) => ({ ...d, city: v }))}
                      placeholder="Lagos"
                    />
                    <Field
                      label="State / Region"
                      value={delivery.state}
                      onChange={(v) => setDelivery((d) => ({ ...d, state: v }))}
                      placeholder="Lagos State"
                    />
                    <Field
                      label="Postal Code"
                      value={delivery.postal}
                      onChange={(v) =>
                        setDelivery((d) => ({ ...d, postal: v }))
                      }
                      placeholder="100001"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2
                    className="font-bold text-onyx text-lg flex items-center gap-2"
                    style={{ fontFamily: "'Roboto Slab',sans-serif" }}
                  >
                    <span className="material-symbols-outlined text-oceanic text-[20px]">
                      payment
                    </span>
                    Payment Method
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { k: "card", l: "Credit / Debit Card", i: "credit_card" },
                      { k: "paypal", l: "PayPal", i: "account_balance_wallet" },
                      { k: "cod", l: "Pay on Delivery", i: "payments" },
                    ].map((m) => (
                      <button
                        key={m.k}
                        type="button"
                        onClick={() =>
                          setPayment((p) => ({ ...p, method: m.k }))
                        }
                        className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200"
                        style={{
                          border: `2px solid ${payment.method === m.k ? "#003F47" : "#EDE3D2"}`,
                          background:
                            payment.method === m.k
                              ? "rgba(0,63,71,0.05)"
                              : "#fff",
                          boxShadow:
                            payment.method === m.k
                              ? "0 2px 10px rgba(0,63,71,0.15)"
                              : "",
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background:
                              payment.method === m.k ? "#003F47" : "#F5EBD8",
                          }}
                        >
                          <span
                            className="material-symbols-outlined text-[16px]"
                            style={{
                              color:
                                payment.method === m.k ? "#FFBD76" : "#9AAAB5",
                            }}
                          >
                            {m.i}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-semibold ${payment.method === m.k ? "text-onyx" : "text-onyx/50"}`}
                        >
                          {m.l}
                        </span>
                      </button>
                    ))}
                  </div>

                  {payment.method === "card" && (
                    <div
                      className="space-y-4 p-4 rounded-2xl"
                      style={{
                        background: "#FAF4EC",
                        border: "1px solid #EDE3D2",
                      }}
                    >
                      <Field
                        label="Cardholder Name"
                        value={payment.cardName}
                        onChange={(v) =>
                          setPayment((p) => ({ ...p, cardName: v }))
                        }
                        placeholder="John Doe"
                      />
                      <Field
                        label="Card Number"
                        value={payment.cardNum}
                        onChange={(v) =>
                          setPayment((p) => ({
                            ...p,
                            cardNum: v.replace(/\D/g, "").slice(0, 16),
                          }))
                        }
                        placeholder="1234 5678 9012 3456"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Field
                          label="Expiry (MM/YY)"
                          value={payment.expiry}
                          onChange={(v) =>
                            setPayment((p) => ({ ...p, expiry: v }))
                          }
                          placeholder="12/27"
                        />
                        <Field
                          label="CVV"
                          value={payment.cvv}
                          onChange={(v) =>
                            setPayment((p) => ({
                              ...p,
                              cvv: v.replace(/\D/g, "").slice(0, 4),
                            }))
                          }
                          placeholder="123"
                          type="password"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-onyx/40 mt-1">
                        <span className="material-symbols-outlined text-[14px] text-emerald-500 material-symbols-filled">
                          lock
                        </span>
                        Your card details are encrypted and secure
                      </div>
                    </div>
                  )}
                  {payment.method === "paypal" && (
                    <div
                      className="p-6 rounded-2xl text-center"
                      style={{
                        background: "#FAF4EC",
                        border: "1px solid #EDE3D2",
                      }}
                    >
                      <span className="material-symbols-outlined text-4xl text-oceanic/30 block mb-2">
                        account_balance_wallet
                      </span>
                      <p className="text-sm text-onyx/55">
                        You will be redirected to PayPal to complete your
                        payment securely.
                      </p>
                    </div>
                  )}
                  {payment.method === "cod" && (
                    <div
                      className="p-5 rounded-2xl flex items-start gap-3"
                      style={{
                        background: "rgba(255,189,118,0.08)",
                        border: "1px solid rgba(255,189,118,0.3)",
                      }}
                    >
                      <span className="material-symbols-outlined text-nectarine-dark text-xl mt-0.5">
                        info
                      </span>
                      <p className="text-sm text-onyx/65 leading-relaxed">
                        Pay with cash when your order is delivered. A small COD
                        fee of <strong>$2.00</strong> may apply.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2
                    className="font-bold text-onyx text-lg flex items-center gap-2"
                    style={{ fontFamily: "'Roboto Slab',sans-serif" }}
                  >
                    <span className="material-symbols-outlined text-oceanic text-[20px]">
                      fact_check
                    </span>
                    Review Your Order
                  </h2>

                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-onyx/35 uppercase tracking-[0.1em]">
                      Items Ordered
                    </p>
                    {items.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{
                          background: "#F5EBD8",
                          border: "1px solid #EDE3D2",
                        }}
                      >
                        {item.thumbnail_url && (
                          <img
                            src={item.thumbnail_url}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                            style={{ border: "1px solid #EDE3D2" }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-onyx text-sm line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-onyx/45 mt-0.5">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="font-bold text-onyx tabular-nums text-sm shrink-0">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="p-4 rounded-2xl space-y-1"
                    style={{
                      background: "#F5EBD8",
                      border: "1px solid #EDE3D2",
                    }}
                  >
                    <p className="text-[11px] font-bold text-onyx/35 uppercase tracking-[0.1em] mb-2">
                      Delivering To
                    </p>
                    <p className="font-semibold text-onyx text-sm">
                      {delivery.fullName}
                    </p>
                    <p className="text-sm text-onyx/55">
                      {delivery.address}, {delivery.city}
                    </p>
                    <p className="text-sm text-onyx/55">
                      {delivery.state && `${delivery.state}, `}
                      {delivery.country}
                    </p>
                    <p className="text-sm text-onyx/55">
                      {delivery.email} · {delivery.phone}
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-oceanic font-semibold hover:underline mt-1 block"
                    >
                      Edit delivery
                    </button>
                  </div>

                  <div
                    className="p-4 rounded-2xl"
                    style={{
                      background: "#F5EBD8",
                      border: "1px solid #EDE3D2",
                    }}
                  >
                    <p className="text-[11px] font-bold text-onyx/35 uppercase tracking-[0.1em] mb-2">
                      Payment
                    </p>
                    <p className="text-sm font-semibold text-onyx capitalize flex items-center gap-2">
                      <span className="material-symbols-outlined text-oceanic text-[16px]">
                        {payment.method === "card"
                          ? "credit_card"
                          : payment.method === "paypal"
                            ? "account_balance_wallet"
                            : "payments"}
                      </span>
                      {payment.method === "card"
                        ? `Card ending in ${payment.cardNum.slice(-4) || "****"}`
                        : payment.method === "paypal"
                          ? "PayPal"
                          : "Cash on Delivery"}
                    </p>
                    <button
                      onClick={() => setStep(2)}
                      className="text-xs text-oceanic font-semibold hover:underline mt-1 block"
                    >
                      Edit payment
                    </button>
                  </div>

                  {error && (
                    <div
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-red-700"
                      style={{
                        background: "#fee2e2",
                        border: "1px solid #fca5a5",
                      }}
                    >
                      <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0 material-symbols-filled">
                        error
                      </span>
                      {error}
                    </div>
                  )}

                  <p className="text-xs text-onyx/35 leading-relaxed">
                    By placing this order you agree to our{" "}
                    <Link href="#" className="text-oceanic hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-oceanic hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              )}

              {/* Nav buttons */}
              <div
                className="flex items-center justify-between mt-8 pt-5 border-t"
                style={{ borderColor: "#EDE3D2" }}
              >
                {step > 1 ? (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="btn-ghost text-sm h-10 gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_back
                    </span>
                    Back
                  </button>
                ) : (
                  <span />
                )}
                {step < 3 ? (
                  <button
                    onClick={() => canAdvance() && setStep((s) => s + 1)}
                    disabled={!canAdvance()}
                    className="btn-primary text-sm h-11 px-6 gap-2"
                    style={{
                      opacity: canAdvance() ? 1 : 0.5,
                      cursor: canAdvance() ? "pointer" : "not-allowed",
                    }}
                  >
                    Continue
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={placeOrder}
                    disabled={placing}
                    className="btn-primary text-sm h-11 px-6 gap-2"
                    style={{ minWidth: "160px" }}
                  >
                    {placing ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">
                          progress_activity
                        </span>
                        Placing…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">
                          check_circle
                        </span>
                        Place Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Order summary sidebar ──────────────────────── */}
          <div>
            <div
              className="bg-white rounded-2xl p-5 sticky top-24"
              style={{
                border: "1px solid #EDE3D2",
                boxShadow: "0 2px 12px rgba(10,23,29,0.06)",
              }}
            >
              <p
                className="font-bold text-onyx text-sm mb-4 flex items-center gap-2"
                style={{ fontFamily: "'Roboto Slab',sans-serif" }}
              >
                <span className="material-symbols-outlined text-oceanic text-[17px]">
                  shopping_bag
                </span>
                Order Summary
              </p>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center gap-3"
                  >
                    <div className="relative shrink-0">
                      <div
                        className="w-12 h-12 rounded-xl overflow-hidden bg-wheat"
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
                            <span className="material-symbols-outlined text-2xl text-onyx/15">
                              image
                            </span>
                          </div>
                        )}
                      </div>
                      <span
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                        style={{ background: "#003F47", color: "#FFF6E9" }}
                      >
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-onyx line-clamp-2 leading-snug">
                        {item.name}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-onyx tabular-nums shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className="space-y-2 text-sm border-t pt-4"
                style={{ borderColor: "#EDE3D2" }}
              >
                <div className="flex justify-between">
                  <span className="text-onyx/50">Subtotal</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-onyx/50">Shipping</span>
                  <span
                    className={`font-semibold tabular-nums ${shipping === 0 ? "text-emerald-600" : ""}`}
                  >
                    {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-onyx/50">Tax (7.5%)</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(tax)}
                  </span>
                </div>
              </div>
              <div
                className="flex justify-between items-baseline border-t mt-3 pt-3"
                style={{ borderColor: "#EDE3D2" }}
              >
                <span className="font-bold text-onyx">Total</span>
                <span
                  className="font-black text-onyx text-xl tabular-nums"
                  style={{ fontFamily: "'Roboto Slab',sans-serif" }}
                >
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-onyx/35 justify-center">
                <span className="material-symbols-outlined text-[14px] text-emerald-500 material-symbols-filled">
                  lock
                </span>
                SSL encrypted · Safe checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
