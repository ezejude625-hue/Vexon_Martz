"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

const AVATAR_COLORS = [
  "#003F47",
  "#7C3AED",
  "#E8A355",
  "#059669",
  "#0ea5e9",
  "#ec4899",
  "#6B7D8A",
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filter !== "all") params.set("status", filter);
      if (search) params.set("q", search);
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data || []);
        setTotal(data.pagination?.total || data.data?.length || 0);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filter, search]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black text-onyx"
            style={{ fontFamily: "Syne,sans-serif", letterSpacing: "-0.025em" }}
          >
            Customers
          </h1>
          <p className="text-onyx/45 text-sm mt-0.5">
            {total} registered customers
          </p>
        </div>
        <button
          onClick={() => {
            const csv = [
              "Name,Email,Phone,Orders,Joined",
              ...customers.map(
                (c) =>
                  `${c.firstName} ${c.lastName},${c.email},${c.phone || ""},${c._count?.orders || 0},${c.createdAt}`,
              ),
            ].join("\n");
            const a = document.createElement("a");
            a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
            a.download = "customers.csv";
            a.click();
          }}
          className="btn-primary text-sm gap-2 h-10"
        >
          <span className="material-symbols-outlined text-[16px]">
            download
          </span>
          Export
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: total, icon: "group", color: "#003F47" },
          {
            label: "Active",
            value: customers.filter((c) => c.isActive).length,
            icon: "person_check",
            color: "#22c55e",
          },
          {
            label: "New Month",
            value: customers.filter(
              (c) => new Date(c.createdAt).getMonth() === new Date().getMonth(),
            ).length,
            icon: "person_add",
            color: "#0ea5e9",
          },
          {
            label: "Suspended",
            value: customers.filter((c) => !c.isActive).length,
            icon: "block",
            color: "#ef4444",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 8px rgba(10,23,29,0.05)",
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
              style={{ background: `${s.color}12` }}
            >
              <span
                className="material-symbols-outlined text-[17px]"
                style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}
              >
                {s.icon}
              </span>
            </div>
            <p
              className="text-xl font-black text-onyx tabular-nums"
              style={{ fontFamily: "Syne,sans-serif" }}
            >
              {s.value}
            </p>
            <p className="text-[11px] text-onyx/40 font-semibold uppercase tracking-[0.06em] mt-0.5">
              {s.label}
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
          {["all", "active", "suspended"].map((f) => (
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
            placeholder="Search customers…"
            className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none"
            style={{ background: "#F5EBD8", border: "1.5px solid transparent" }}
            onFocus={(e) => (e.target.style.borderColor = "#003F47")}
            onBlur={(e) => (e.target.style.borderColor = "transparent")}
          />
        </div>
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: "1px solid #EDE3D2",
          boxShadow: "0 2px 12px rgba(10,23,29,0.06)",
        }}
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-4xl text-onyx/15 animate-spin block mb-2">
                progress_activity
              </span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: "#FAF4EC",
                    borderBottom: "1px solid #EDE3D2",
                  }}
                >
                  {["Customer", "Phone", "Orders", "Joined", "Status", ""].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] ${i === 5 ? "text-right" : "text-left"}`}
                        style={{ color: "#6B7D8A" }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#F2EAE0" }}>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <span className="material-symbols-outlined text-5xl text-onyx/12 block mb-2">
                        group
                      </span>
                      <p className="text-onyx/35 font-semibold">
                        No customers found
                      </p>
                    </td>
                  </tr>
                ) : (
                  customers.map((c, idx) => (
                    <tr
                      key={c.id}
                      className="transition-colors duration-150"
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#FAF4EC")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                            style={{
                              background: `${AVATAR_COLORS[idx % AVATAR_COLORS.length]}12`,
                              color: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                            }}
                          >
                            {c.firstName?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-onyx text-sm">
                              {c.firstName} {c.lastName}
                            </p>
                            <p className="text-[11px] text-onyx/35 font-mono">
                              {c.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-onyx/50">
                        {c.phone || "—"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-onyx tabular-nums">
                        {c._count?.orders || 0}
                      </td>
                      <td className="px-5 py-4 text-onyx/45 whitespace-nowrap text-sm">
                        {formatDate(c.createdAt, {
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                        >
                          {c.isActive ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="text-xs font-bold text-oceanic hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <div
          className="flex items-center justify-between px-5 py-3.5 border-t"
          style={{ borderColor: "#EDE3D2", background: "#FAF4EC" }}
        >
          <p className="text-xs text-onyx/40">
            {customers.length} of {total}
          </p>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs font-semibold text-oceanic hover:underline"
          >
            <span className="material-symbols-outlined text-[14px]">
              refresh
            </span>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
