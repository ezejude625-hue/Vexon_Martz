"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_OPTS = ["pending","processing","shipped","delivered","cancelled","refunded"];
const PAY_OPTS    = ["unpaid","paid","refunded","partially_refunded"];
const STATUS_STYLES = {
  delivered:  { badge:"bg-emerald-100 text-emerald-700", dot:"#22c55e" },
  processing: { badge:"bg-blue-100 text-blue-700",       dot:"#0ea5e9" },
  shipped:    { badge:"bg-amber-100 text-amber-700",     dot:"#f59e0b" },
  pending:    { badge:"bg-gray-100 text-gray-600",       dot:"#9ca3af" },
  cancelled:  { badge:"bg-red-100 text-red-700",         dot:"#ef4444" },
  refunded:   { badge:"bg-red-100 text-red-700",         dot:"#ef4444" },
};
const PAY_STYLES = {
  paid:                { badge:"bg-emerald-100 text-emerald-700" },
  unpaid:              { badge:"bg-amber-100 text-amber-700" },
  refunded:            { badge:"bg-red-100 text-red-700" },
  partially_refunded:  { badge:"bg-orange-100 text-orange-700" },
};

export default function AdminOrderDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState("");
  const [payStatus,setPayStatus] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setStatus(data.data.status);
        setPayStatus(data.data.paymentStatus);
      }
    } catch {}
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function showToast(msg, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function saveChanges() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, payment_status: payStatus }),
      });
      const data = await res.json();
      if (data.success) { showToast("Order updated"); load(); }
      else showToast(data.message || "Failed", false);
    } catch { showToast("Network error", false); }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="max-w-5xl space-y-5">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse" style={{ border:"1px solid #EDE3D2", height:160 }}>
            <div className="h-5 bg-wheat rounded w-1/4 mb-4" />
            <div className="h-4 bg-wheat rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-6xl text-onyx/10 block mb-3">receipt_long</span>
        <p className="text-onyx/40 font-semibold">Order not found</p>
        <Link href="/admin/orders" className="btn-primary text-sm mt-4 inline-flex">Back to Orders</Link>
      </div>
    );
  }

  const ss = STATUS_STYLES[order.status]  || STATUS_STYLES.pending;
  const ps = PAY_STYLES[order.paymentStatus] || PAY_STYLES.unpaid;
  const c  = order.user || {};
  const changed = status !== order.status || payStatus !== order.paymentStatus;

  return (
    <div className="max-w-5xl space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold animate-[fadeIn_0.2s_ease] ${toast.ok ? "bg-oceanic text-wheat" : "bg-red-600 text-white"}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.ok ? "check_circle" : "error"}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-onyx/50 hover:text-onyx hover:bg-wheat transition-all"
            style={{ border:"1px solid #EDE3D2" }}>
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-black text-onyx" style={{ fontFamily:"Roboto Slab,sans-serif" }}>
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-onyx/40 mt-0.5">{formatDate(order.createdAt, { dateStyle:"medium" })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize flex items-center gap-1.5 ${ss.badge}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background:ss.dot }} />
            {order.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${ps.badge}`}>{order.paymentStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — order items + summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border:"1px solid #EDE3D2", boxShadow:"0 2px 12px rgba(10,23,29,0.06)" }}>
            <div className="px-6 py-4 border-b font-bold text-onyx" style={{ borderColor:"#EDE3D2", fontFamily:"Roboto Slab,sans-serif" }}>
              Order Items ({order.items?.length || 0})
            </div>
            <div className="divide-y" style={{ borderColor:"#F2EAE0" }}>
              {(order.items || []).map(item => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-wheat shrink-0">
                    {item.product?.thumbnailUrl
                      ? <img src={item.product.thumbnailUrl} alt={item.productName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px] text-onyx/20">inventory_2</span>
                        </div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-onyx text-sm truncate">{item.productName}</p>
                    {item.product?.sku && <p className="text-[11px] text-onyx/35 mt-0.5">SKU: {item.product.sku}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-onyx tabular-nums">{formatCurrency(parseFloat(item.unitPrice || 0))}</p>
                    <p className="text-[11px] text-onyx/40">× {item.quantity}</p>
                  </div>
                  <p className="font-black text-onyx tabular-nums w-20 text-right shrink-0">
                    {formatCurrency(parseFloat(item.totalPrice || 0))}
                  </p>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="px-6 py-4 space-y-2 border-t" style={{ borderColor:"#EDE3D2", background:"#FAF4EC" }}>
              {[
                { l:"Subtotal",  v: order.subtotal },
                { l:"Discount",  v: order.discountAmount, neg:true },
                { l:"Shipping",  v: order.shippingAmount },
                { l:"Tax",       v: order.taxAmount },
              ].map(row => row.v > 0 && (
                <div key={row.l} className="flex justify-between text-sm text-onyx/60">
                  <span>{row.l}</span>
                  <span className="tabular-nums">{row.neg ? "−" : ""}{formatCurrency(parseFloat(row.v || 0))}</span>
                </div>
              ))}
              <div className="flex justify-between font-black text-onyx text-lg pt-2 border-t" style={{ borderColor:"#EDE3D2" }}>
                <span>Total</span>
                <span className="tabular-nums text-oceanic">{formatCurrency(parseFloat(order.totalAmount || 0))}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          {order.address && (
            <div className="bg-white rounded-2xl p-5" style={{ border:"1px solid #EDE3D2" }}>
              <p className="font-bold text-onyx mb-3 text-sm" style={{ fontFamily:"Roboto Slab,sans-serif" }}>Shipping Address</p>
              <p className="font-semibold text-onyx">{order.address.fullName}</p>
              <p className="text-sm text-onyx/60 mt-0.5">{order.address.street}</p>
              <p className="text-sm text-onyx/60">{order.address.city}{order.address.state ? `, ${order.address.state}` : ""} {order.address.postalCode}</p>
              <p className="text-sm text-onyx/60">{order.address.country}</p>
              {order.address.phone && <p className="text-sm text-onyx/60 mt-1">{order.address.phone}</p>}
            </div>
          )}
        </div>

        {/* Right — customer + status management */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white rounded-2xl p-5" style={{ border:"1px solid #EDE3D2" }}>
            <p className="font-bold text-onyx mb-3 text-sm" style={{ fontFamily:"Roboto Slab,sans-serif" }}>Customer</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-oceanic/10 flex items-center justify-center font-bold text-oceanic text-sm shrink-0">
                {c.firstName?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-semibold text-onyx">{c.firstName} {c.lastName}</p>
                <p className="text-[12px] text-onyx/40">{c.email}</p>
              </div>
            </div>
            {c.phone && (
              <div className="flex items-center gap-2 text-sm text-onyx/60 mb-2">
                <span className="material-symbols-outlined text-[15px]">phone</span>
                {c.phone}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-onyx/60">
              <span className="material-symbols-outlined text-[15px]">calendar_month</span>
              Customer since {formatDate(c.createdAt, { month:"short", year:"numeric" })}
            </div>
            <Link href={`/admin/customers/${order.userId}`}
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold text-oceanic hover:bg-oceanic/5 transition-all"
              style={{ border:"1px solid rgba(0,63,71,0.2)" }}>
              View Profile <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {/* Status management */}
          <div className="bg-white rounded-2xl p-5" style={{ border:"1px solid #EDE3D2", boxShadow:"0 2px 10px rgba(10,23,29,0.05)" }}>
            <p className="font-bold text-onyx mb-4 text-sm" style={{ fontFamily:"Roboto Slab,sans-serif" }}>Manage Order</p>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-onyx/40 uppercase tracking-[0.06em] block mb-1.5">Order Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl text-sm font-medium text-onyx bg-wheat border-0 focus:outline-none focus:ring-2 focus:ring-oceanic/25 cursor-pointer">
                  {STATUS_OPTS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-onyx/40 uppercase tracking-[0.06em] block mb-1.5">Payment Status</label>
                <select value={payStatus} onChange={e => setPayStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl text-sm font-medium text-onyx bg-wheat border-0 focus:outline-none focus:ring-2 focus:ring-oceanic/25 cursor-pointer">
                  {PAY_OPTS.map(s => <option key={s} value={s} className="capitalize">{s.replace("_"," ")}</option>)}
                </select>
              </div>
              <button onClick={saveChanges} disabled={saving || !changed}
                className="w-full btn-primary h-10 text-sm gap-2 mt-1"
                style={{ opacity: (!changed && !saving) ? 0.45 : 1 }}>
                {saving
                  ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Saving…</>
                  : <><span className="material-symbols-outlined text-[16px]">save</span> Save Changes</>
                }
              </button>
            </div>
          </div>

          {/* Order meta */}
          <div className="bg-white rounded-2xl p-5" style={{ border:"1px solid #EDE3D2" }}>
            <p className="font-bold text-onyx mb-3 text-sm" style={{ fontFamily:"Roboto Slab,sans-serif" }}>Order Info</p>
            <div className="space-y-2.5">
              {[
                { l:"Payment Method", v: (order.paymentMethod || "—").replace("_"," ") },
                { l:"Order Date",     v: formatDate(order.createdAt, { dateStyle:"medium" }) },
                { l:"Last Updated",   v: formatDate(order.updatedAt, { dateStyle:"medium" }) },
                { l:"Currency",       v: order.currency || "USD" },
              ].map(row => (
                <div key={row.l} className="flex justify-between text-sm">
                  <span className="text-onyx/40">{row.l}</span>
                  <span className="font-semibold text-onyx capitalize">{row.v}</span>
                </div>
              ))}
            </div>
            {order.notes && (
              <div className="mt-3 pt-3 border-t text-sm text-onyx/60" style={{ borderColor:"#EDE3D2" }}>
                <p className="font-semibold text-onyx/50 text-xs uppercase tracking-wider mb-1">Notes</p>
                <p>{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
