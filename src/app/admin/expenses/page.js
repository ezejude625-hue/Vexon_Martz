"use client";
import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

const CAT_ICON = {
  infrastructure: "dns",
  marketing: "campaign",
  salaries: "people",
  operations: "build",
  other: "category",
};
const CAT_COLOR = {
  infrastructure: "#0ea5e9",
  marketing: "#E8A355",
  salaries: "#22c55e",
  operations: "#7C3AED",
  other: "#6B7D8A",
};
const CAT_BADGE = {
  infrastructure: "bg-blue-100 text-blue-700",
  marketing: "bg-amber-100 text-amber-700",
  salaries: "bg-emerald-100 text-emerald-700",
  operations: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-600",
};
const CATS = [
  "all",
  "operations",
  "marketing",
  "infrastructure",
  "salaries",
  "other",
];

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    description: "",
    category: "operations",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (cat !== "all") params.set("category", cat);
      const res = await fetch(`/api/admin/expenses?${params}`);
      const data = await res.json();
      if (data.success) setExpenses(data.data || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [cat]);

  async function addExpense() {
    if (!form.description || !form.amount)
      return setMsg({
        type: "error",
        text: "Description and amount are required",
      });
    setSaving(true);
    try {
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          description: form.description,
          amount: parseFloat(form.amount),
          date: form.date,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "Expense logged!" });
        setShowForm(false);
        setForm({
          description: "",
          category: "operations",
          amount: "",
          date: new Date().toISOString().slice(0, 10),
        });
        load();
      } else setMsg({ type: "error", text: data.message });
    } catch {
      setMsg({ type: "error", text: "Failed" });
    }
    setSaving(false);
    setTimeout(() => setMsg(null), 3000);
  }

  async function deleteExpense(id) {
    if (!confirm("Delete this expense?")) return;
    try {
      const res = await fetch(`/api/admin/expenses/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "Deleted" });
        load();
      }
    } catch {}
    setTimeout(() => setMsg(null), 3000);
  }

  const filtered = expenses.filter((e) => cat === "all" || e.category === cat);
  const total = filtered.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black text-onyx"
            style={{ fontFamily: "Syne,sans-serif", letterSpacing: "-0.025em" }}
          >
            Expenses
          </h1>
          <p className="text-onyx/45 text-sm mt-0.5">
            Track and manage operational costs
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const csv = [
                "#,Description,Category,Date,Amount",
                ...filtered.map(
                  (e, i) =>
                    `${i + 1},"${e.description}",${e.category},${e.date || e.createdAt},${e.amount}`,
                ),
              ].join("\n");
              const a = document.createElement("a");
              a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
              a.download = "expenses.csv";
              a.click();
            }}
            className="btn-ghost text-sm h-10 gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">
              download
            </span>
            Export CSV
          </button>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="btn-primary text-sm gap-2 h-10"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Log Expense
          </button>
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
              add_circle
            </span>
            New Expense
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Description *</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="e.g. AWS Hosting — April"
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
            <div>
              <label className="label">Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
                className="input-field"
              >
                {CATS.filter((c) => c !== "all").map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Amount (USD) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder="0.00"
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
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="input-field"
                onFocus={(e) => (e.target.style.borderColor = "#003F47")}
                onBlur={(e) => (e.target.style.borderColor = "#E2D5C0")}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={addExpense}
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
                  Save
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

      <div
        className="bg-white rounded-2xl p-4 flex flex-wrap items-center gap-3"
        style={{
          border: "1px solid #EDE3D2",
          boxShadow: "0 2px 8px rgba(10,23,29,0.05)",
        }}
      >
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background: cat === c ? "#003F47" : "#F5EBD8",
                color: cat === c ? "#FFF6E9" : "#6B7D8A",
                boxShadow: cat === c ? "0 2px 8px rgba(0,63,71,0.25)" : "",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-onyx/40">Total:</span>
          <span
            className="font-black text-onyx tabular-nums"
            style={{ fontFamily: "Syne,sans-serif" }}
          >
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: "1px solid #EDE3D2",
          boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
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
                  {["#", "Description", "Category", "Date", "Amount", ""].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] ${i >= 4 ? "text-right" : "text-left"}`}
                        style={{ color: "#6B7D8A" }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#F2EAE0" }}>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <span className="material-symbols-outlined text-5xl text-onyx/12 block mb-2">
                        receipt_long
                      </span>
                      <p className="text-onyx/35 font-semibold">
                        No expenses logged yet
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((e, i) => (
                    <tr
                      key={e.id}
                      className="transition-colors duration-150"
                      onMouseEnter={(x) =>
                        (x.currentTarget.style.background = "#FAF4EC")
                      }
                      onMouseLeave={(x) =>
                        (x.currentTarget.style.background = "")
                      }
                    >
                      <td className="px-5 py-4 text-[11px] text-onyx/30 font-mono">
                        #{i + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              background: `${CAT_COLOR[e.category] || "#6B7D8A"}12`,
                            }}
                          >
                            <span
                              className="material-symbols-outlined text-[15px]"
                              style={{
                                color: CAT_COLOR[e.category] || "#6B7D8A",
                              }}
                            >
                              {CAT_ICON[e.category] || "category"}
                            </span>
                          </div>
                          <span className="font-medium text-onyx text-sm">
                            {e.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${CAT_BADGE[e.category] || "bg-gray-100 text-gray-600"}`}
                        >
                          {e.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-onyx/45 text-sm">
                        {formatDate(e.date || e.createdAt, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-onyx tabular-nums">
                        {formatCurrency(e.amount || 0)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => deleteExpense(e.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-onyx/30 hover:text-red-500 hover:bg-red-50 transition-all ml-auto"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    background: "#FAF4EC",
                    borderTop: "2px solid #EDE3D2",
                  }}
                >
                  <td
                    colSpan={4}
                    className="px-5 py-3 text-sm font-bold text-onyx/55"
                  >
                    {filtered.length} expense{filtered.length !== 1 ? "s" : ""}
                  </td>
                  <td
                    className="px-5 py-3 text-right font-black text-onyx tabular-nums"
                    style={{ fontFamily: "Syne,sans-serif" }}
                  >
                    {formatCurrency(total)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
