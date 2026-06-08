"use client";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

const STATUS_STYLES = {
  open: { badge: "bg-red-100 text-red-700", dot: "#ef4444", label: "Open" },
  in_progress: {
    badge: "bg-amber-100 text-amber-700",
    dot: "#f59e0b",
    label: "In Progress",
  },
  resolved: {
    badge: "bg-emerald-100 text-emerald-700",
    dot: "#22c55e",
    label: "Resolved",
  },
  closed: {
    badge: "bg-gray-100 text-gray-600",
    dot: "#9ca3af",
    label: "Closed",
  },
};
const PRIORITY_COLOR = {
  urgent: "#ef4444",
  high: "#f59e0b",
  medium: "#0ea5e9",
  low: "#9ca3af",
};
const FILTER_TABS = ["all", "open", "in_progress", "resolved", "closed"];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusF, setStatusF] = useState("all");
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (statusF !== "all") params.set("status", statusF);
      const res = await fetch(`/api/admin/support?${params}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.data || []);
        if (selected) {
          const updated = (data.data || []).find((t) => t.id === selected.id);
          if (updated) setSelected(updated);
        }
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [statusF]);

  async function sendReply(e) {
    e.preventDefault();
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selected.id, body: reply.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setReply("");
        await load();
      }
    } catch {}
    setSending(false);
  }

  async function changeStatus(ticketId, newStatus) {
    try {
      await fetch(`/api/admin/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await load();
    } catch {}
  }

  const filtered = tickets.filter(
    (t) =>
      (statusF === "all" || t.status === statusF) &&
      (!search ||
        t.subject?.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.firstName?.toLowerCase().includes(search.toLowerCase())),
  );
  const openCount = tickets.filter((t) => t.status === "open").length;
  const urgentCount = tickets.filter(
    (t) =>
      t.priority === "urgent" &&
      t.status !== "resolved" &&
      t.status !== "closed",
  ).length;

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black text-onyx"
            style={{ fontFamily: "Syne,sans-serif", letterSpacing: "-0.025em" }}
          >
            Support Tickets
          </h1>
          <p className="text-sm mt-0.5">
            <span className="text-red-500 font-semibold">{openCount} open</span>
            <span className="text-onyx/30 mx-1.5">·</span>
            <span className="text-amber-500 font-semibold">
              {urgentCount} urgent
            </span>
          </p>
        </div>
      </div>

      <div
        className="bg-white rounded-2xl p-4 flex flex-wrap gap-3"
        style={{
          border: "1px solid #EDE3D2",
          boxShadow: "0 2px 8px rgba(10,23,29,0.05)",
        }}
      >
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setStatusF(t)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all duration-150"
              style={{
                background: statusF === t ? "#003F47" : "#F5EBD8",
                color: statusF === t ? "#FFF6E9" : "#6B7D8A",
                boxShadow: statusF === t ? "0 2px 8px rgba(0,63,71,0.25)" : "",
              }}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[160px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-onyx/30 text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets…"
            className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none"
            style={{ background: "#F5EBD8", border: "1.5px solid transparent" }}
            onFocus={(e) => (e.target.style.borderColor = "#003F47")}
            onBlur={(e) => (e.target.style.borderColor = "transparent")}
          />
        </div>
      </div>

      <div className="flex gap-5" style={{ minHeight: "540px" }}>
        <div
          className={`flex flex-col gap-2 ${selected ? "hidden lg:flex lg:w-96 shrink-0" : "flex-1"}`}
        >
          {loading ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-4xl text-onyx/15 animate-spin block">
                progress_activity
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="bg-white rounded-2xl py-16 text-center"
              style={{ border: "1px solid #EDE3D2" }}
            >
              <span className="material-symbols-outlined text-5xl text-onyx/12 block mb-2">
                support_agent
              </span>
              <p className="text-onyx/35 font-semibold">No tickets found</p>
            </div>
          ) : (
            filtered.map((t) => {
              const s = STATUS_STYLES[t.status] || STATUS_STYLES.open;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className="w-full text-left bg-white rounded-2xl p-4 transition-all duration-150"
                  style={{
                    border: `1.5px solid ${selected?.id === t.id ? "#003F47" : "#EDE3D2"}`,
                    boxShadow:
                      selected?.id === t.id
                        ? "0 4px 16px rgba(0,63,71,0.15)"
                        : "0 2px 8px rgba(10,23,29,0.05)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-2 h-2 rounded-full mt-2 shrink-0"
                      style={{
                        background: PRIORITY_COLOR[t.priority] || "#9ca3af",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-onyx text-sm leading-snug line-clamp-2">
                          {t.subject}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${s.badge}`}
                        >
                          {s.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-onyx/45 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">
                            person
                          </span>
                          {t.user?.firstName} {t.user?.lastName}
                        </span>
                        <span className="text-[11px] font-mono text-onyx/30">
                          TKT-{String(t.id).padStart(3, "0")}
                        </span>
                        {t.priority && (
                          <span
                            className="text-[11px] font-semibold capitalize"
                            style={{ color: PRIORITY_COLOR[t.priority] }}
                          >
                            {t.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-onyx/35 mt-1">
                        {formatDate(t.createdAt, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {selected && (
          <div
            className="flex-1 bg-white rounded-2xl overflow-hidden flex flex-col"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 16px rgba(10,23,29,0.08)",
            }}
          >
            <div
              className="px-5 py-4 border-b flex items-center gap-3"
              style={{ borderColor: "#EDE3D2", background: "#FAF4EC" }}
            >
              <button
                onClick={() => setSelected(null)}
                className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl text-onyx/50 hover:bg-wheat transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-onyx text-sm truncate">
                  {selected.subject}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[11px] text-onyx/45">
                    TKT-{String(selected.id).padStart(3, "0")}
                  </span>
                  <span className="text-[11px] text-onyx/45">
                    · {selected.user?.firstName} {selected.user?.lastName}
                  </span>
                  {selected.priority && (
                    <span
                      className="text-[11px] font-semibold capitalize"
                      style={{ color: PRIORITY_COLOR[selected.priority] }}
                    >
                      {selected.priority} priority
                    </span>
                  )}
                </div>
              </div>
              <select
                value={selected.status}
                onChange={(e) => changeStatus(selected.id, e.target.value)}
                className="h-8 px-2.5 rounded-xl text-xs font-semibold outline-none border cursor-pointer"
                style={{
                  background: "#fff",
                  borderColor: "#E2D5C0",
                  color: "#3D5060",
                }}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div
              className="flex-1 overflow-y-auto p-5 space-y-4"
              style={{ maxHeight: "380px" }}
            >
              {(selected.messages || []).map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.isStaff ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black"
                    style={{
                      background: msg.isStaff ? "#003F47" : "#F5EBD8",
                      color: msg.isStaff ? "#FFBD76" : "#3D5060",
                    }}
                  >
                    {msg.isStaff ? (
                      <span className="material-symbols-outlined text-[16px]">
                        support_agent
                      </span>
                    ) : (
                      selected.user?.firstName?.charAt(0) || "?"
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] flex flex-col gap-1 ${msg.isStaff ? "items-end" : ""}`}
                  >
                    <div
                      className="px-4 py-3 text-sm leading-relaxed"
                      style={{
                        background: msg.isStaff ? "#003F47" : "#F5EBD8",
                        color: msg.isStaff ? "#FFF6E9" : "#0A171D",
                        borderRadius: msg.isStaff
                          ? "20px 6px 20px 20px"
                          : "6px 20px 20px 20px",
                        boxShadow: msg.isStaff
                          ? "0 2px 12px rgba(0,63,71,0.25)"
                          : "0 2px 8px rgba(10,23,29,0.07)",
                      }}
                    >
                      {msg.body}
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[11px] text-onyx/35">
                        {msg.isStaff
                          ? "Support Team"
                          : selected.user?.firstName}
                      </span>
                      <span className="text-[10px] text-onyx/25">
                        {formatDate(msg.createdAt, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {(selected.messages || []).length === 0 && (
                <div className="text-center py-8 text-onyx/35 text-sm">
                  No messages yet
                </div>
              )}
            </div>

            <div
              className="border-t p-4"
              style={{ borderColor: "#EDE3D2", background: "#FAF4EC" }}
            >
              <form onSubmit={sendReply} className="space-y-3">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={3}
                  placeholder="Type your reply to the customer…"
                  className="input-field resize-none py-3 text-sm"
                  style={{ height: "auto" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#003F47";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0,63,71,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E2D5C0";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="btn-primary text-sm h-9 px-4 gap-1.5"
                  >
                    {sending ? (
                      <>
                        <span className="material-symbols-outlined text-[15px] animate-spin">
                          progress_activity
                        </span>
                        Sending…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[15px]">
                          send
                        </span>
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!selected && !loading && filtered.length > 0 && (
          <div
            className="hidden lg:flex flex-1 bg-white rounded-2xl items-center justify-center text-center"
            style={{ border: "1px solid #EDE3D2" }}
          >
            <div>
              <span className="material-symbols-outlined text-6xl text-onyx/12 block mb-3">
                forum
              </span>
              <p className="font-semibold text-onyx/35">
                Select a ticket to view conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
