"use client";
import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_STYLES = {
  active: {
    badge: "bg-emerald-100 text-emerald-700",
    dot: "#22c55e",
    label: "Active",
  },
  pending: {
    badge: "bg-amber-100 text-amber-700",
    dot: "#f59e0b",
    label: "Pending",
  },
  suspended: {
    badge: "bg-red-100 text-red-700",
    dot: "#ef4444",
    label: "Suspended",
  },
};
const AVATAR_COLORS = [
  "#003F47",
  "#ec4899",
  "#E8A355",
  "#7C3AED",
  "#059669",
  "#ef4444",
];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [changing, setChanging] = useState(null);
  const [msg, setMsg] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filter !== "all") params.set("status", filter);
      const res = await fetch(`/api/admin/vendors?${params}`);
      const data = await res.json();
      if (data.success) setVendors(data.data || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function changeStatus(id, status) {
    setChanging(id);
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: `Vendor ${status}` });
        load();
      } else setMsg({ type: "error", text: data.message });
    } catch {
      setMsg({ type: "error", text: "Failed" });
    }
    setChanging(null);
    setTimeout(() => setMsg(null), 3000);
  }

  const filtered = vendors
    .filter((v) => filter === "all" || v.status === filter)
    .filter(
      (v) =>
        !search ||
        v.storeName?.toLowerCase().includes(search.toLowerCase()) ||
        v.user?.email?.toLowerCase().includes(search.toLowerCase()),
    );
  const activeCount = vendors.filter((v) => v.status === "active").length;
  const pendingCount = vendors.filter((v) => v.status === "pending").length;
  const totalRevenue = vendors
    .filter((v) => v.status === "active")
    .reduce((s, v) => s + (v.totalRevenue || 0), 0);
  const avgRating =
    vendors.length > 0
      ? (
          vendors.reduce((s, v) => s + (v.rating || 0), 0) / vendors.length
        ).toFixed(1)
      : 0;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black text-onyx"
            style={{ fontFamily: "Syne,sans-serif", letterSpacing: "-0.025em" }}
          >
            Vendors
          </h1>
          <p className="text-sm text-onyx/45 mt-0.5">
            <span className="text-emerald-600 font-semibold">
              {activeCount} active
            </span>
            {pendingCount > 0 && (
              <span className="text-amber-500 font-semibold ml-2">
                · {pendingCount} pending approval
              </span>
            )}
          </p>
        </div>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            l: "Total Vendors",
            v: vendors.length,
            i: "storefront",
            c: "#003F47",
          },
          { l: "Active", v: activeCount, i: "check_circle", c: "#22c55e" },
          {
            l: "Vendor Revenue",
            v: formatCurrency(totalRevenue),
            i: "payments",
            c: "#E8A355",
          },
          { l: "Avg Rating", v: `${avgRating}★`, i: "star", c: "#7C3AED" },
        ].map((k) => (
          <div
            key={k.l}
            className="bg-white rounded-2xl p-4"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 8px rgba(10,23,29,0.05)",
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${k.c}12` }}
            >
              <span
                className="material-symbols-outlined text-[17px]"
                style={{ color: k.c, fontVariationSettings: "'FILL' 1" }}
              >
                {k.i}
              </span>
            </div>
            <p
              className="text-xl font-black text-onyx tabular-nums"
              style={{ fontFamily: "Syne,sans-serif" }}
            >
              {k.v}
            </p>
            <p className="text-[11px] text-onyx/40 font-semibold uppercase tracking-[0.06em] mt-0.5">
              {k.l}
            </p>
          </div>
        ))}
      </div>

      <div
        className="bg-white rounded-2xl p-4 flex flex-wrap gap-3"
        style={{
          border: "1px solid #EDE3D2",
          boxShadow: "0 2px 8px rgba(10,23,29,0.05)",
        }}
      >
        <div className="flex gap-1.5">
          {["all", "active", "pending", "suspended"].map((f) => (
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
            placeholder="Search vendors…"
            className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none"
            style={{ background: "#F5EBD8", border: "1.5px solid transparent" }}
            onFocus={(e) => (e.target.style.borderColor = "#003F47")}
            onBlur={(e) => (e.target.style.borderColor = "transparent")}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <span className="material-symbols-outlined text-4xl text-onyx/15 animate-spin block mb-2">
            progress_activity
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div
              className="col-span-3 bg-white rounded-2xl py-16 text-center"
              style={{ border: "1px solid #EDE3D2" }}
            >
              <span className="material-symbols-outlined text-5xl text-onyx/12 block mb-2">
                storefront
              </span>
              <p className="text-onyx/35 font-semibold">No vendors found</p>
            </div>
          ) : (
            filtered.map((v, idx) => {
              const s = STATUS_STYLES[v.status] || STATUS_STYLES.pending;
              const ac = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const isChanging = changing === v.id;
              return (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl p-5 transition-all duration-200"
                  style={{
                    border: "1px solid #EDE3D2",
                    boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 8px 28px rgba(10,23,29,0.10)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 2px 10px rgba(10,23,29,0.05)";
                    e.currentTarget.style.transform = "";
                  }}
                >
                  <div
                    className="flex items-start gap-3 mb-4 pb-4 border-b"
                    style={{ borderColor: "#F2EAE0" }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0"
                      style={{ background: `${ac}14`, color: ac }}
                    >
                      {(v.storeName || v.user?.firstName || "?").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <p className="font-bold text-onyx text-sm">
                          {v.storeName ||
                            `${v.user?.firstName} ${v.user?.lastName}`}
                        </p>
                        {v.isVerified && (
                          <span
                            className="material-symbols-outlined text-oceanic text-[14px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            verified
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-onyx/40">
                        {v.user?.email}
                      </p>
                      <p className="text-[11px] text-onyx/30 mt-0.5">
                        Joined{" "}
                        {formatDate(v.createdAt, {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${s.badge}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { l: "Products", v: v._count?.products || 0 },
                      { l: "Sales", v: (v.totalSales || 0).toLocaleString() },
                      {
                        l: "Revenue",
                        v: formatCurrency((v.totalRevenue || 0) / 1000) + "k",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.l}
                        className="text-center p-2.5 rounded-xl"
                        style={{ background: "#F5EBD8" }}
                      >
                        <p className="font-black text-onyx text-sm tabular-nums">
                          {stat.v}
                        </p>
                        <p className="text-[10px] text-onyx/40 font-semibold">
                          {stat.l}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {v.status === "pending" && (
                      <button
                        onClick={() => changeStatus(v.id, "active")}
                        disabled={isChanging}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-emerald-700 transition-all"
                        style={{
                          background: "#dcfce7",
                          border: "1px solid #bbf7d0",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#22c55e";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#dcfce7";
                          e.currentTarget.style.color = "#166534";
                        }}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isChanging ? "progress_activity" : "check_circle"}
                        </span>
                        {isChanging ? "Saving…" : "Approve"}
                      </button>
                    )}
                    {v.status === "active" && (
                      <button
                        onClick={() => changeStatus(v.id, "suspended")}
                        disabled={isChanging}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: "#F5EBD8",
                          color: "#6B7D8A",
                          border: "1px solid #E2D5C0",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fee2e2";
                          e.currentTarget.style.color = "#991b1b";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#F5EBD8";
                          e.currentTarget.style.color = "#6B7D8A";
                        }}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          block
                        </span>
                        Suspend
                      </button>
                    )}
                    {v.status === "suspended" && (
                      <button
                        onClick={() => changeStatus(v.id, "active")}
                        disabled={isChanging}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-emerald-700 transition-all"
                        style={{
                          background: "#dcfce7",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          lock_open
                        </span>
                        Reinstate
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
