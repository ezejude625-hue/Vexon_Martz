"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
const PAY_BADGE = {
  paid:     "bg-emerald-100 text-emerald-700",
  unpaid:   "bg-amber-100 text-amber-700",
  refunded: "bg-red-100 text-red-700",
};
const AVATAR_COLORS = ["#003F47","#7C3AED","#E8A355","#059669","#0ea5e9","#ec4899"];

export default function AdminCustomerDetailPage() {
  const { id }    = useParams();
  const router    = useRouter();
  const [customer, setCustomer]  = useState(null);
  const [loading,  setLoading]   = useState(true);
  const [saving,   setSaving]    = useState(false);
  const [toast,    setToast]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/customers/${id}`);
      const data = await res.json();
      if (data.success) setCustomer(data.data);
    } catch {}
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function showToast(msg, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function toggleActive() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !customer.isActive }),
      });
      const data = await res.json();
      if (data.success) { showToast(customer.isActive ? "Customer suspended" : "Customer restored"); load(); }
      else showToast(data.message || "Failed", false);
    } catch { showToast("Network error", false); }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="max-w-5xl space-y-5">
        {[1,2].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse h-48" style={{ border:"1px solid #EDE3D2" }}>
            <div className="h-5 bg-wheat rounded w-1/4 mb-4" />
            <div className="h-4 bg-wheat rounded w-2/3 mb-2" />
            <div className="h-4 bg-wheat rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-6xl text-onyx/10 block mb-3">person_off</span>
        <p className="text-onyx/40 font-semibold">Customer not found</p>
        <Link href="/admin/customers" className="btn-primary text-sm mt-4 inline-flex">Back to Customers</Link>
      </div>
    );
  }

  const avatarColor = AVATAR_COLORS[customer.id % AVATAR_COLORS.length];
  const totalSpend  = (customer.orders || []).reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
  const initials    = `${customer.firstName?.charAt(0) || ""}${customer.lastName?.charAt(0) || ""}`.toUpperCase();

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
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-sm text-onyx/40 mt-0.5">Customer #{customer.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${customer.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
            {customer.isActive ? "Active" : "Suspended"}
          </span>
          <button onClick={toggleActive} disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${customer.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
            style={{ border:`1px solid ${customer.isActive ? "#fca5a5" : "#6ee7b7"}` }}>
            <span className="material-symbols-outlined text-[14px]">{customer.isActive ? "person_off" : "person_check"}</span>
            {saving ? "Saving…" : customer.isActive ? "Suspend" : "Restore"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Customer profile */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="bg-white rounded-2xl p-5" style={{ border:"1px solid #EDE3D2", boxShadow:"0 2px 10px rgba(10,23,29,0.05)" }}>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0" style={{ background:avatarColor }}>
                {initials || "?"}
              </div>
              <div>
                <p className="font-bold text-onyx">{customer.firstName} {customer.lastName}</p>
                <p className="text-sm text-onyx/45 break-all">{customer.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon:"phone",         l:"Phone",       v:customer.phone || "—" },
                { icon:"badge",         l:"Role",        v:customer.role,           cap:true },
                { icon:"verified",      l:"Email",       v:customer.emailVerified ? "Verified" : "Unverified" },
                { icon:"calendar_month",l:"Joined",      v:formatDate(customer.createdAt, { dateStyle:"medium" }) },
                { icon:"schedule",      l:"Last Login",  v:customer.lastLogin ? formatDate(customer.lastLogin, { dateStyle:"medium" }) : "Never" },
              ].map(row => (
                <div key={row.l} className="flex items-center gap-2.5 text-sm">
                  <span className="material-symbols-outlined text-[16px] text-onyx/30">{row.icon}</span>
                  <span className="text-onyx/40 w-20 shrink-0">{row.l}</span>
                  <span className={`font-medium text-onyx ${row.cap ? "capitalize" : ""}`}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { l:"Orders",  v:customer._count?.orders  || 0, color:"#003F47" },
              { l:"Reviews", v:customer._count?.reviews || 0, color:"#7C3AED" },
              { l:"Spent",   v:formatCurrency(totalSpend), color:"#059669" },
            ].map(s => (
              <div key={s.l} className="bg-white rounded-2xl p-3 text-center" style={{ border:"1px solid #EDE3D2" }}>
                <p className="text-lg font-black tabular-nums" style={{ fontFamily:"Roboto Slab,sans-serif", color:s.color }}>{s.v}</p>
                <p className="text-[10px] text-onyx/40 font-semibold uppercase tracking-wider mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Addresses */}
          {customer.addresses?.length > 0 && (
            <div className="bg-white rounded-2xl p-5" style={{ border:"1px solid #EDE3D2" }}>
              <p className="font-bold text-onyx mb-3 text-sm" style={{ fontFamily:"Roboto Slab,sans-serif" }}>Addresses</p>
              <div className="space-y-3">
                {customer.addresses.map(addr => (
                  <div key={addr.id} className="text-sm p-3 rounded-xl" style={{ background:"#FAF4EC" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-onyx">{addr.label}</span>
                      {addr.isDefault && <span className="text-[10px] font-bold text-oceanic">Default</span>}
                    </div>
                    <p className="text-onyx/60">{addr.street}, {addr.city}, {addr.country}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order history */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border:"1px solid #EDE3D2", boxShadow:"0 2px 12px rgba(10,23,29,0.06)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor:"#EDE3D2" }}>
              <div>
                <p className="font-bold text-onyx" style={{ fontFamily:"Roboto Slab,sans-serif" }}>Order History</p>
                <p className="text-[11px] text-onyx/40 mt-0.5">{customer._count?.orders || 0} total orders</p>
              </div>
            </div>
            {!customer.orders?.length ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-5xl text-onyx/10 block mb-3">receipt_long</span>
                <p className="font-semibold text-onyx/35 text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background:"#FAF4EC", borderBottom:"1px solid #EDE3D2" }}>
                      {["Order","Items","Amount","Payment","Status","Date",""].map((h,i) => (
                        <th key={h} className={`px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] ${i===6?"text-right":"text-left"}`} style={{ color:"#6B7D8A" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor:"#F2EAE0" }}>
                    {customer.orders.map(order => {
                      const sb = STATUS_BADGE[order.status]  || "bg-gray-100 text-gray-600";
                      const pb = PAY_BADGE[order.paymentStatus] || "bg-gray-100 text-gray-600";
                      return (
                        <tr key={order.id} className="transition-colors duration-150"
                          onMouseEnter={e => e.currentTarget.style.background = "#FAF4EC"}
                          onMouseLeave={e => e.currentTarget.style.background = ""}>
                          <td className="px-5 py-3.5 font-mono text-xs font-semibold text-oceanic">#{order.orderNumber?.slice(-8)}</td>
                          <td className="px-5 py-3.5 text-onyx/55">{order._count?.items || 0}</td>
                          <td className="px-5 py-3.5 font-bold text-onyx tabular-nums">{formatCurrency(parseFloat(order.totalAmount || 0))}</td>
                          <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${pb}`}>{order.paymentStatus}</span></td>
                          <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${sb}`}>{order.status}</span></td>
                          <td className="px-5 py-3.5 text-onyx/45 whitespace-nowrap">{formatDate(order.createdAt, { month:"short", day:"numeric" })}</td>
                          <td className="px-5 py-3.5 text-right">
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
      </div>
    </div>
  );
}
