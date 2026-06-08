"use client";
// ============================================================
// ADMIN LAYOUT — src/app/admin/layout.js
// ============================================================
// Premium Onyx sidebar with Nectarine accents · Perfect icon
// alignment · Smooth hover states · Branded top bar
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [{ icon: "dashboard", label: "Dashboard", href: "/admin" }],
  },
  {
    title: "Catalogue",
    items: [
      { icon: "inventory_2", label: "Products", href: "/admin/products" },
      { icon: "receipt_long", label: "Orders", href: "/admin/orders" },
      { icon: "storefront", label: "Vendors", href: "/admin/vendors" },
    ],
  },
  {
    title: "People",
    items: [
      { icon: "group", label: "Customers", href: "/admin/customers" },
      { icon: "support_agent", label: "Support", href: "/admin/support" },
    ],
  },
  {
    title: "Finance",
    items: [
      { icon: "account_balance", label: "Finance", href: "/admin/finance" },
      { icon: "receipt", label: "Expenses", href: "/admin/expenses" },
      { icon: "local_offer", label: "Coupons", href: "/admin/coupons" },
    ],
  },
  {
    title: "Insights",
    items: [
      { icon: "bar_chart", label: "Analytics", href: "/admin/analytics" },
      { icon: "description", label: "Reports", href: "/admin/reports" },
    ],
  },
  {
    title: "System",
    items: [
      { icon: "manage_accounts", label: "Roles", href: "/admin/roles" },
      { icon: "settings", label: "Settings", href: "/admin/settings" },
    ],
  },
];

// Flatten for breadcrumb lookup
const ALL_NAV = NAV_SECTIONS.flatMap((s) => s.items);

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Find current section label
  const currentPage = ALL_NAV.find(
    (n) =>
      pathname === n.href ||
      (n.href !== "/admin" && pathname.startsWith(n.href)),
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#F2EAE0" }}
    >
      {/* ── Sidebar ────────────────────────────── */}
      <aside
        className={cn(
          "flex flex-col bg-onyx shrink-0 transition-all duration-300 overflow-hidden",
          collapsed ? "w-[68px]" : "w-[240px]",
        )}
        style={{ boxShadow: "4px 0 24px rgba(10,23,29,0.25)" }}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-white/8 shrink-0">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-nectarine/15 flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-nectarine text-[17px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  storefront
                </span>
              </div>
              <span
                className="text-wheat font-black text-base tracking-tight truncate"
                style={{
                  fontFamily: '"Roboto Slab", sans-serif',
                  fontWeight: 800,
                }}
              >
                Vexon<span className="text-nectarine">Mart</span>
              </span>
              <span className="ml-auto shrink-0 text-[9px] bg-nectarine/20 text-nectarine font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                Admin
              </span>
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-nectarine/15 mx-auto flex items-center justify-center">
              <span
                className="material-symbols-outlined text-nectarine text-[17px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                storefront
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {/* Section title */}
              {!collapsed && (
                <p className="text-[10px] font-bold text-wheat/20 uppercase tracking-[0.12em] px-3 mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        isActive ? "sidebar-link-active" : "sidebar-link",
                        collapsed && "justify-center px-0",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="material-symbols-outlined text-[20px] shrink-0">
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin user + collapse toggle */}
        <div className="p-3 border-t border-white/8 shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 px-2 py-2">
              <div className="w-8 h-8 rounded-xl bg-nectarine/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-nectarine text-[15px]">
                  admin_panel_settings
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-wheat text-xs font-semibold truncate">
                  Super Admin
                </p>
                <p className="text-wheat/30 text-[10px] truncate">
                  admin@vexonmart.com
                </p>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg text-wheat/30 hover:text-wheat/60 hover:bg-white/8 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chevron_left
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              className="flex items-center justify-center w-full py-2 rounded-xl text-wheat/30 hover:text-wheat/60 hover:bg-white/8 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ───────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="h-16 flex items-center px-6 gap-4 shrink-0"
          style={{
            background: "#FFFFFF",
            borderBottom: "1px solid #EDE3D2",
            boxShadow: "0 1px 0 rgba(10,23,29,0.06)",
          }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/admin"
              className="text-onyx/35 hover:text-onyx/60 transition-colors font-medium"
            >
              Admin
            </Link>
            {currentPage && currentPage.href !== "/admin" && (
              <>
                <span className="material-symbols-outlined text-onyx/20 text-base">
                  chevron_right
                </span>
                <span className="font-semibold text-onyx">
                  {currentPage.label}
                </span>
              </>
            )}
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-onyx/30 text-[18px] pointer-events-none">
                search
              </span>
              <input
                type="search"
                placeholder="Quick search…"
                className="w-48 h-9 pl-9 pr-4 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: "#F5EBD8",
                  border: "1.5px solid transparent",
                  color: "#0A171D",
                }}
                onFocus={(e) => {
                  e.target.style.width = "220px";
                  e.target.style.borderColor = "#003F47";
                  e.target.style.boxShadow = "0 0 0 3px rgba(0,63,71,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.width = "192px";
                  e.target.style.borderColor = "transparent";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Notifications */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-onyx/45 hover:text-onyx hover:bg-wheat-dark transition-all duration-200">
              <span className="material-symbols-outlined text-[20px]">
                notifications
              </span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
            </button>

            {/* View store */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-oceanic hover:bg-oceanic/8 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[15px]">
                open_in_new
              </span>
              View Store
            </Link>

            {/* Admin avatar */}
            <div className="w-9 h-9 rounded-xl bg-oceanic/12 flex items-center justify-center">
              <span className="material-symbols-outlined text-oceanic text-[18px]">
                account_circle
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
