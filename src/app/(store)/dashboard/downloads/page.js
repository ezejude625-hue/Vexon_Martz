"use client";
// ============================================================
// DASHBOARD DOWNLOADS — src/app/(store)/dashboard/downloads/page.js
// ============================================================

import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const FILES = [
  {
    id: 1,
    name: "React 19 Mastery Video Course",
    cat: "Course",
    order: "VXM-20240301-A3K9",
    date: "2024-03-01",
    size: "2.4 GB",
    ver: "2.1",
    count: 3,
    ok: true,
    color: "#7C3AED",
    icon: "school",
  },
  {
    id: 2,
    name: "Next.js 14 Fullstack Boilerplate",
    cat: "Script",
    order: "VXM-20240228-B7F2",
    date: "2024-02-28",
    size: "18.6 MB",
    ver: "1.0",
    count: 1,
    ok: true,
    color: "#0ea5e9",
    icon: "code",
  },
  {
    id: 3,
    name: "Premium UI Design System (Figma)",
    cat: "Design Asset",
    order: "VXM-20240210-C1M4",
    date: "2024-02-10",
    size: "340 MB",
    ver: "3.5",
    count: 5,
    ok: true,
    color: "#ec4899",
    icon: "palette",
  },
  {
    id: 4,
    name: "MySQL Performance Masterclass",
    cat: "Course",
    order: "VXM-20240115-D9X1",
    date: "2024-01-15",
    size: "1.1 GB",
    ver: "1.2",
    count: 0,
    ok: false,
    color: "#6B7D8A",
    icon: "school",
  },
];

export default function DownloadsPage() {
  const [downloading, setDownloading] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = FILES.filter(
    (f) => !search || f.name.toLowerCase().includes(search.toLowerCase()),
  );
  const available = FILES.filter((f) => f.ok).length;

  async function handleDownload(id) {
    setDownloading(id);
    await new Promise((r) => setTimeout(r, 1200));
    setDownloading(null);
    // In production: POST /api/downloads/:id → returns signed URL
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black text-onyx tracking-tight"
            style={{
              fontFamily: '"Roboto Slab",sans-serif',
              letterSpacing: "-0.025em",
            }}
          >
            Downloads
          </h1>
          <p className="text-onyx/45 text-sm mt-0.5">
            <span className="text-emerald-600 font-semibold">{available}</span>{" "}
            file{available !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-onyx/30 text-[18px] pointer-events-none">
          search
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search downloads…"
          className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none transition-all"
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
      </div>

      {/* Files */}
      <div className="space-y-3">
        {filtered.map((f) => {
          const isDling = downloading === f.id;
          return (
            <div
              key={f.id}
              className="bg-white rounded-2xl p-5 transition-all duration-200"
              style={{
                border: `1px solid ${f.ok ? "#EDE3D2" : "#EDE3D2"}`,
                boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
                opacity: f.ok ? 1 : 0.55,
              }}
              onMouseEnter={(e) => {
                if (f.ok) {
                  e.currentTarget.style.boxShadow =
                    "0 6px 24px rgba(10,23,29,0.10)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 2px 10px rgba(10,23,29,0.05)";
                e.currentTarget.style.transform = "";
              }}
            >
              <div className="flex items-center gap-4">
                {/* File type icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: `${f.color}12`,
                    border: `1px solid ${f.color}22`,
                  }}
                >
                  <span
                    className="material-symbols-outlined text-[26px]"
                    style={{ color: f.color }}
                  >
                    {f.icon}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <p className="font-bold text-onyx text-sm truncate">
                      {f.name}
                    </p>
                    {!f.ok && (
                      <span
                        className="badge badge-error"
                        style={{ fontSize: "10px" }}
                      >
                        Expired
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span
                      className="badge"
                      style={{
                        background: `${f.color}12`,
                        color: f.color,
                        fontSize: "10px",
                      }}
                    >
                      {f.cat}
                    </span>
                    <span className="text-[11px] text-onyx/40 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">
                        schedule
                      </span>
                      {formatDate(f.date, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-[11px] text-onyx/40 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">
                        data_usage
                      </span>
                      {f.size}
                    </span>
                    <span className="text-[11px] text-onyx/40">v{f.ver}</span>
                    <span className="text-[11px] text-onyx/40 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">
                        download
                      </span>
                      {f.count}×
                    </span>
                  </div>
                </div>

                {/* Download button */}
                <div className="shrink-0">
                  {f.ok ? (
                    <button
                      onClick={() => handleDownload(f.id)}
                      disabled={!!isDling}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                      style={{
                        background: isDling ? "#dcfce7" : "#003F47",
                        color: isDling ? "#16a34a" : "#FFF6E9",
                        boxShadow: isDling
                          ? ""
                          : "0 4px 14px rgba(0,63,71,0.3)",
                      }}
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] ${isDling ? "animate-spin-smooth" : ""}`}
                      >
                        {isDling ? "progress_activity" : "download"}
                      </span>
                      {isDling ? "Loading…" : "Download"}
                    </button>
                  ) : (
                    <span className="text-xs text-onyx/35 font-medium">
                      Link expired
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info banner */}
      <div
        className="flex items-start gap-3 p-4 rounded-2xl"
        style={{
          background: "rgba(0,63,71,0.05)",
          border: "1px solid rgba(0,63,71,0.12)",
        }}
      >
        <span className="material-symbols-outlined text-oceanic text-xl mt-0.5 shrink-0">
          info
        </span>
        <p className="text-sm text-onyx/55 leading-relaxed">
          Download links are available for{" "}
          <strong className="text-onyx">lifetime</strong> on most digital
          products. Having issues?{" "}
          <Link
            href="/dashboard/messages"
            className="text-oceanic font-semibold hover:underline"
          >
            Contact support
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
