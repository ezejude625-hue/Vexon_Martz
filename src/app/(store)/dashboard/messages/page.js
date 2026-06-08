"use client";
// ============================================================
// DASHBOARD MESSAGES — src/app/(store)/dashboard/messages/page.js
// ============================================================

import { useState } from "react";
import { formatDate } from "@/lib/utils";

const THREADS = [
  {
    id: 1,
    from: "VexonMart Support",
    icon: "support_agent",
    color: "#003F47",
    subject: "Issue with order VXM-20240301-A3K9",
    preview:
      "We received your report and a replacement will ship within 48 hours.",
    date: "2024-03-02",
    unread: true,
    msgs: [
      {
        from: "You",
        body: "Hello, I received a damaged package for my Sony headphones order.",
        date: "2024-03-01",
        me: true,
      },
      {
        from: "VexonMart Support",
        body: "Hi Amara, we're sorry about this. We've raised a replacement request and it will ship within 48 hours. You'll receive a new tracking number by email.",
        date: "2024-03-02",
        me: false,
      },
    ],
  },
  {
    id: 2,
    from: "TechZone Official",
    icon: "storefront",
    color: "#7C3AED",
    subject: "Question about React 19 course content",
    preview:
      "Yes, the course covers all Next.js 14 App Router patterns in full depth.",
    date: "2024-02-20",
    unread: false,
    msgs: [
      {
        from: "You",
        body: "Hi! Does the React 19 course cover the new Next.js 14 App Router?",
        date: "2024-02-19",
        me: true,
      },
      {
        from: "TechZone Official",
        body: "Absolutely! The course covers all Next.js 14 App Router patterns including Server Components, RSC, streaming, and production deployment.",
        date: "2024-02-20",
        me: false,
      },
    ],
  },
  {
    id: 3,
    from: "VexonMart",
    icon: "campaign",
    color: "#E8A355",
    subject: "Welcome to VexonMart — your account is ready!",
    preview:
      "Start exploring thousands of premium products across all categories.",
    date: "2024-01-01",
    unread: false,
    msgs: [
      {
        from: "VexonMart",
        body: "Welcome to VexonMart, Amara! Your account is fully set up. Start exploring thousands of premium products. Use code WELCOME10 for 10% off your first order.",
        date: "2024-01-01",
        me: false,
      },
    ],
  },
];

export default function MessagesPage() {
  const [selected, setSelected] = useState(THREADS[0]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [threads, setThreads] = useState(THREADS);

  async function handleSend(e) {
    e.preventDefault();
    if (!reply.trim() || !selected) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    // Optimistically add message to thread
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? {
              ...t,
              msgs: [
                ...t.msgs,
                {
                  from: "You",
                  body: reply,
                  date: new Date().toISOString().slice(0, 10),
                  me: true,
                },
              ],
              unread: false,
            }
          : t,
      ),
    );
    setSending(false);
    setReply("");
  }

  // Mark as read on select
  function selectThread(t) {
    setSelected(t);
    setThreads((prev) =>
      prev.map((th) => (th.id === t.id ? { ...th, unread: false } : th)),
    );
  }

  const unreadCount = threads.filter((t) => t.unread).length;

  return (
    <div className="space-y-4">
      <div>
        <h1
          className="text-2xl font-black text-onyx tracking-tight"
          style={{
            fontFamily: '"Roboto Slab",sans-serif',
            letterSpacing: "-0.025em",
          }}
        >
          Messages
        </h1>
        <p className="text-onyx/45 text-sm mt-0.5">
          {unreadCount > 0 ? (
            <span className="text-oceanic font-semibold">
              {unreadCount} unread
            </span>
          ) : (
            "All caught up"
          )}{" "}
          · {threads.length} conversations
        </p>
      </div>

      {/* Two-panel layout */}
      <div
        className="bg-white rounded-2xl overflow-hidden flex"
        style={{
          border: "1px solid #EDE3D2",
          boxShadow: "0 2px 16px rgba(10,23,29,0.07)",
          minHeight: "540px",
        }}
      >
        {/* Thread list */}
        <div
          className="w-full sm:w-72 border-r flex flex-col shrink-0"
          style={{ borderColor: "#EDE3D2" }}
        >
          {/* Search */}
          <div className="p-3 border-b" style={{ borderColor: "#EDE3D2" }}>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-onyx/30 text-[16px] pointer-events-none">
                search
              </span>
              <input
                type="search"
                placeholder="Search messages…"
                className="w-full h-9 pl-9 pr-3 rounded-xl text-sm outline-none"
                style={{ background: "#F5EBD8", border: "none" }}
              />
            </div>
          </div>

          {/* Thread items */}
          <ul
            className="flex-1 overflow-y-auto divide-y"
            style={{ borderColor: "#F5EBD8" }}
          >
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => selectThread(t)}
                  className="w-full text-left px-4 py-3.5 transition-colors duration-150"
                  style={{
                    background:
                      selected?.id === t.id ? "#F5EBD8" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (selected?.id !== t.id)
                      e.currentTarget.style.background = "#FAF4EC";
                  }}
                  onMouseLeave={(e) => {
                    if (selected?.id !== t.id)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: `${t.color}12`,
                        border: `1px solid ${t.color}20`,
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-[17px]"
                        style={{ color: t.color }}
                      >
                        {t.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p
                          className={`text-sm truncate ${t.unread ? "font-bold text-onyx" : "font-medium text-onyx/65"}`}
                        >
                          {t.from}
                        </p>
                        <span className="text-[10px] text-onyx/35 shrink-0">
                          {formatDate(t.date, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-onyx/50 truncate">
                        {t.subject}
                      </p>
                      <p className="text-[11px] text-onyx/35 truncate mt-0.5">
                        {t.preview}
                      </p>
                    </div>
                    {t.unread && (
                      <div className="w-2 h-2 rounded-full bg-oceanic shrink-0 mt-2" />
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Thread detail */}
        <div className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <>
              {/* Thread header */}
              <div
                className="px-5 py-4 border-b flex items-center gap-3"
                style={{ borderColor: "#EDE3D2", background: "#FAF4EC" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${selected.color}12` }}
                >
                  <span
                    className="material-symbols-outlined text-[17px]"
                    style={{ color: selected.color }}
                  >
                    {selected.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-onyx text-sm">{selected.from}</p>
                  <p className="text-xs text-onyx/40 truncate">
                    {selected.subject}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {selected.msgs.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.me ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black"
                      style={{
                        background: msg.me ? "#FFBD76" : "#003F47",
                        color: msg.me ? "#0A171D" : "#FFF6E9",
                      }}
                    >
                      {msg.me ? (
                        "Me"
                      ) : (
                        <span className="material-symbols-outlined text-[15px]">
                          {selected.icon}
                        </span>
                      )}
                    </div>
                    {/* Bubble */}
                    <div
                      className={`max-w-[78%] flex flex-col gap-1 ${msg.me ? "items-end" : ""}`}
                    >
                      <div
                        className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                        style={{
                          background: msg.me ? "#003F47" : "#F5EBD8",
                          color: msg.me ? "#FFF6E9" : "#0A171D",
                          borderRadius: msg.me
                            ? "20px 6px 20px 20px"
                            : "6px 20px 20px 20px",
                          boxShadow: msg.me
                            ? "0 2px 12px rgba(0,63,71,0.25)"
                            : "0 2px 8px rgba(10,23,29,0.07)",
                        }}
                      >
                        {msg.body}
                      </div>
                      <span className="text-[10px] text-onyx/30 px-1">
                        {formatDate(msg.date, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply input */}
              <form
                onSubmit={handleSend}
                className="p-4 border-t flex gap-3"
                style={{ borderColor: "#EDE3D2", background: "#FAF4EC" }}
              >
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply…"
                  className="flex-1 h-11 px-4 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "#fff", border: "1.5px solid #E2D5C0" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#003F47";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0,63,71,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E2D5C0";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background:
                      sending || !reply.trim() ? "#F5EBD8" : "#003F47",
                    color: sending || !reply.trim() ? "#9AAAB5" : "#FFF6E9",
                    boxShadow:
                      reply.trim() && !sending
                        ? "0 4px 14px rgba(0,63,71,0.3)"
                        : "",
                  }}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${sending ? "animate-spin-smooth" : ""}`}
                  >
                    {sending ? "progress_activity" : "send"}
                  </span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <span className="material-symbols-outlined text-6xl text-onyx/12 block mb-3">
                  forum
                </span>
                <p className="font-semibold text-onyx/35">
                  Select a conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
