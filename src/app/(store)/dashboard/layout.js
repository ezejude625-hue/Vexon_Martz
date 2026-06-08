"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    icon: "dashboard",
    label: "Overview",
    href: "/dashboard",
    desc: "Account summary",
  },
  {
    icon: "receipt_long",
    label: "My Orders",
    href: "/dashboard/orders",
    desc: "Track purchases",
  },
  {
    icon: "favorite",
    label: "Wishlist",
    href: "/dashboard/wishlist",
    desc: "Saved items",
  },
  {
    icon: "download",
    label: "Downloads",
    href: "/dashboard/downloads",
    desc: "Digital products",
  },
  {
    icon: "forum",
    label: "Messages",
    href: "/dashboard/messages",
    desc: "Inbox",
  },
  {
    icon: "manage_accounts",
    label: "Settings",
    href: "/dashboard/settings",
    desc: "Profile & prefs",
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Load user from DB ──────────────────────────────────────
  const loadUser = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
      } else {
        // Not logged in — redirect to login
        router.replace("/auth/login");
      }
    } catch {
      router.replace("/auth/login");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  // Derive avatar display
  const initials = user?.firstName?.charAt(0).toUpperCase() || "U";
  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Account";
  const avatarUrl = user?.avatarUrl || null;

  if (loading)
    return (
      <div className="min-h-screen bg-wheat flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-onyx/20 animate-spin">
          progress_activity
        </span>
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-var(--nav-height))] bg-wheat">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 items-start">
          {/* ── Sidebar ──────────────────────── */}
          <aside className="w-[228px] shrink-0 hidden md:block">
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{
                border: "1px solid #EDE3D2",
                boxShadow: "0 2px 16px rgba(10,23,29,0.07)",
              }}
            >
              {/* User header */}
              <div
                className="relative px-5 py-5 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #003F47 0%, #1C3040 100%)",
                }}
              >
                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full border border-white/8" />
                <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-full border border-white/12" />
                <div className="relative flex items-center gap-3">
                  {/* Avatar — image or initial */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,189,118,0.3), rgba(255,189,118,0.15))",
                      border: "1.5px solid rgba(255,189,118,0.35)",
                      color: "#FFBD76",
                    }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-wheat font-bold text-sm truncate">
                      {fullName}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      <span className="text-wheat/40 text-[11px] capitalize">
                        {user?.role || "Customer"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2 space-y-0.5">
                {NAV.map((item) => {
                  const active =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
                      style={{
                        background: active ? "#003F47" : "transparent",
                        color: active ? "#FFF6E9" : "#3D5060",
                        boxShadow: active
                          ? "0 2px 12px rgba(0,63,71,0.25)"
                          : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "#F5EBD8";
                          e.currentTarget.style.color = "#0A171D";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#3D5060";
                        }
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: active
                            ? "rgba(255,189,118,0.2)"
                            : "rgba(0,63,71,0.07)",
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-[16px]"
                          style={{
                            color: active ? "#FFBD76" : "#003F47",
                            fontVariationSettings: active
                              ? "'FILL' 1"
                              : "'FILL' 0",
                          }}
                        >
                          {item.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{item.label}</p>
                      </div>
                      {active && (
                        <span
                          className="material-symbols-outlined text-[14px]"
                          style={{ color: "#FFBD76" }}
                        >
                          chevron_right
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Sign out */}
              <div className="p-2 border-t" style={{ borderColor: "#EDE3D2" }}>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 w-full transition-all duration-150"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fee2e2")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-red-500 text-[16px]">
                      logout
                    </span>
                  </div>
                  Sign Out
                </button>
              </div>
            </div>

            {/* Help card */}
            <div
              className="mt-4 p-4 rounded-2xl"
              style={{
                background: "rgba(0,63,71,0.05)",
                border: "1px solid rgba(0,63,71,0.12)",
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-oceanic/12 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-oceanic text-[16px]">
                    support_agent
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-onyx">Need help?</p>
                  <p className="text-[11px] text-onyx/45 mt-0.5 leading-relaxed">
                    Our support team is available 24/7.
                  </p>
                  <Link
                    href="/dashboard/messages"
                    className="text-[11px] text-oceanic font-semibold hover:underline mt-1 inline-block"
                  >
                    Chat with us →
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main ─────────────────────────── */}
          <main className="flex-1 min-w-0 page-enter">{children}</main>
        </div>
      </div>
    </div>
  );
}
