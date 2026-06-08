"use client";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "0",
    usageLimit: "",
    expiresAt: "",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons?limit=50");
      const data = await res.json();
      if (data.success) setCoupons(data.data || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createCoupon() {
    if (!form.code || !form.discountValue)
      return setMsg({ type: "error", text: "Code and value are required" });
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          description: form.description,
          discount_type: form.discountType,
          discount_value: parseFloat(form.discountValue),
          min_order_amount: parseFloat(form.minOrderAmount) || 0,
          usage_limit: form.usageLimit ? parseInt(form.usageLimit) : null,
          expires_at: form.expiresAt || null,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "Coupon created!" });
        setShowForm(false);
        setForm({
          code: "",
          description: "",
          discountType: "percentage",
          discountValue: "",
          minOrderAmount: "0",
          usageLimit: "",
          expiresAt: "",
        });
        load();
      } else setMsg({ type: "error", text: data.message });
    } catch {
      setMsg({ type: "error", text: "Failed" });
    }
    setSaving(false);
    setTimeout(() => setMsg(null), 3000);
  }

  async function toggleActive(id, current) {
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      load();
    } catch {}
  }

  async function deleteCoupon(id) {
    if (!confirm("Delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "Coupon deleted" });
        load();
      }
    } catch {}
    setTimeout(() => setMsg(null), 3000);
  }

  return (
    <div className="space-y-6 max-w-[1100px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black text-onyx"
            style={{ fontFamily: "Syne,sans-serif", letterSpacing: "-0.025em" }}
          >
            Coupons & Discounts
          </h1>
          <p className="text-onyx/45 text-sm mt-0.5">
            {coupons.filter((c) => c.isActive).length} active ·{" "}
            {coupons
              .reduce((s, c) => s + (c.usageCount || 0), 0)
              .toLocaleString()}{" "}
            total uses
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="btn-primary text-sm gap-2 h-10"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Create Coupon
        </button>
      </div>

      {msg && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${msg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {msg.type === "success" ? "check_circle" : "error"}
          </span>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div
          className="bg-white rounded-2xl p-6"
          style={{
            border: "1.5px solid #FFBD76",
            boxShadow: "0 4px 20px rgba(255,189,118,0.2)",
          }}
        >
          <h2
            className="font-bold text-onyx mb-4 flex items-center gap-2"
            style={{ fontFamily: "Syne,sans-serif" }}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ color: "#E8A355" }}
            >
              local_offer
            </span>
            Create Coupon
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                label: "Code *",
                key: "code",
                placeholder: "SAVE20",
                mono: true,
              },
              {
                label: "Description",
                key: "description",
                placeholder: "20% off orders",
              },
              {
                label: "Value *",
                key: "discountValue",
                placeholder: "20",
                type: "number",
              },
              {
                label: "Min Order ($)",
                key: "minOrderAmount",
                placeholder: "0",
                type: "number",
              },
              {
                label: "Usage Limit",
                key: "usageLimit",
                placeholder: "Unlimited",
                type: "number",
              },
              { label: "Expires At", key: "expiresAt", type: "date" },
            ].map((f) => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input
                  type={f.type || "text"}
                  value={form[f.key]}
                  placeholder={f.placeholder}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      [f.key]:
                        f.key === "code"
                          ? e.target.value.toUpperCase()
                          : e.target.value,
                    }))
                  }
                  className={`input-field ${f.mono ? "font-mono" : ""}`}
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
            ))}
            <div>
              <label className="label">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, discountType: e.target.value }))
                }
                className="input-field"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={createCoupon}
              disabled={saving}
              className="btn-primary gap-2 h-10"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined text-[15px] animate-spin">
                    progress_activity
                  </span>
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[15px]">
                    save
                  </span>
                  Create
                </>
              )}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn-ghost h-10"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <span className="material-symbols-outlined text-4xl text-onyx/15 animate-spin block mb-2">
            progress_activity
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.length === 0 ? (
            <div
              className="col-span-2 bg-white rounded-2xl py-16 text-center"
              style={{ border: "1px solid #EDE3D2" }}
            >
              <span className="material-symbols-outlined text-5xl text-onyx/12 block mb-2">
                local_offer
              </span>
              <p className="text-onyx/35 font-semibold mb-4">No coupons yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary text-sm inline-flex"
              >
                Create First Coupon
              </button>
            </div>
          ) : (
            coupons.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-5 transition-all duration-200"
                style={{
                  border: `1.5px solid ${c.isActive ? "#EDE3D2" : "#F2EAE0"}`,
                  boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
                  opacity: c.isActive ? 1 : 0.65,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <code className="font-mono font-black text-lg text-onyx tracking-wider">
                        {c.code}
                      </code>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-onyx/55">
                      {c.description || "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className="font-black text-2xl text-oceanic"
                      style={{ fontFamily: "Syne,sans-serif" }}
                    >
                      {c.discountType === "percentage"
                        ? `${c.discountValue}%`
                        : `$${c.discountValue}`}
                    </p>
                    <p className="text-[11px] text-onyx/35 capitalize">
                      {c.discountType} off
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    {
                      l: "Used",
                      v: `${c.usageCount || 0}${c.usageLimit ? `/${c.usageLimit}` : ""}`,
                    },
                    {
                      l: "Min",
                      v: c.minOrderAmount > 0 ? `$${c.minOrderAmount}` : "None",
                    },
                    {
                      l: "Expires",
                      v: c.expiresAt
                        ? formatDate(c.expiresAt, {
                            month: "short",
                            day: "numeric",
                          })
                        : "Never",
                    },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="text-center p-2 rounded-xl"
                      style={{ background: "#F5EBD8" }}
                    >
                      <p className="text-xs font-bold text-onyx">{s.v}</p>
                      <p className="text-[10px] text-onyx/40 font-semibold">
                        {s.l}
                      </p>
                    </div>
                  ))}
                </div>
                {c.usageLimit && (
                  <div className="mb-4">
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "#EDE3D2" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, ((c.usageCount || 0) / c.usageLimit) * 100)}%`,
                          background:
                            (c.usageCount || 0) >= c.usageLimit
                              ? "#ef4444"
                              : "#003F47",
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(c.id, c.isActive)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: c.isActive ? "#fee2e2" : "#dcfce7",
                      color: c.isActive ? "#991b1b" : "#166534",
                    }}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {c.isActive ? "pause" : "play_arrow"}
                    </span>
                    {c.isActive ? "Pause" : "Activate"}
                  </button>
                  <button
                    onClick={() => deleteCoupon(c.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-onyx/30 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
