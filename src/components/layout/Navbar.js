"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Deals", href: "/shop?filter=sale" },
  { label: "Digital", href: "/shop?category=digital-goods" },
];

const USER_MENU = [
  { icon: "dashboard", label: "Overview", href: "/dashboard" },
  { icon: "receipt_long", label: "My Orders", href: "/dashboard/orders" },
  { icon: "favorite", label: "Wishlist", href: "/dashboard/wishlist" },
  { icon: "download", label: "Downloads", href: "/dashboard/downloads" },
  { icon: "manage_accounts", label: "Settings", href: "/dashboard/settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null); // null = not loaded yet
  const [authLoaded, setAuthLoaded] = useState(false);

  // ── Glass scroll effect ───────────────────────────────────
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // ── Load auth + cart from DB ──────────────────────────────
  const loadAuthAndCart = useCallback(async () => {
    try {
      const [meRes, cartRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/cart"),
      ]);
      const [meData, cartData] = await Promise.all([
        meRes.json(),
        cartRes.json(),
      ]);
      setUser(meData.success && meData.data ? meData.data : null);
      setCartCount(cartData.success ? cartData.data?.item_count || 0 : 0);
    } catch {
      setUser(null);
    }
    setAuthLoaded(true);
  }, []);

  // Run on mount and on every route change (catches login/logout)
  useEffect(() => {
    loadAuthAndCart();
  }, [pathname, loadAuthAndCart]);

  // ── Cart badge live update ────────────────────────────────
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch("/api/cart");
        const data = await res.json();
        if (data.success) setCartCount(data.data?.item_count || 0);
      } catch {}
    };
    window.addEventListener("cart:updated", refresh);
    return () => window.removeEventListener("cart:updated", refresh);
  }, []);

  // ── Auto-focus search ─────────────────────────────────────
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [searchOpen]);

  // ── Close menus on route change ───────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(search.trim())}`);
    setSearch("");
    setSearchOpen(false);
    setMobileOpen(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setCartCount(0);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const isLoggedIn = authLoaded && user !== null;
  const userName = user?.firstName || "";
  const userInitial = userName.charAt(0).toUpperCase() || "?";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out",
          scrolled
            ? "bg-onyx shadow-[0_2px_40px_rgba(10,23,29,0.50)] border-b border-white/[0.07]"
            : "bg-onyx border-b border-white/[0.06]",
        )}
        style={{ height: "var(--nav-height)" }}
      >
        <div
          className="h-full flex items-center gap-4 px-5 sm:px-6 lg:px-8"
          style={{ maxWidth: "var(--page-max)", margin: "0 auto" }}
        >
          {/* ── LOGO ────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group mr-2"
          >
            <div className="w-8 h-8 rounded-[10px] bg-nectarine flex items-center justify-center shadow-nectarine flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              <span
                className="material-symbols-outlined text-onyx text-[17px]"
                style={{
                  fontVariationSettings:
                    "'FILL' 1,'wght' 600,'GRAD' 0,'opsz' 24",
                }}
              >
                storefront
              </span>
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="text-wheat font-black text-[17px] tracking-tight"
                style={{ fontFamily: "'Roboto Slab',sans-serif" }}
              >
                Vexon<span className="text-nectarine">Mart</span>
              </span>
              <span className="text-wheat/30 text-[8.5px] tracking-[0.18em] uppercase font-semibold mt-0.5">
                Shop Smarter
              </span>
            </div>
          </Link>

          {/* ── DESKTOP NAV ─────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname.startsWith(href.split("?")[0]);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium transition-all duration-150",
                    active
                      ? "text-nectarine bg-white/[0.07]"
                      : "text-wheat/55 hover:text-wheat hover:bg-white/[0.07]",
                  )}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-nectarine" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── SEARCH BAR ──────────────────────────────── */}
          <div className="hidden md:flex flex-1 max-w-[340px] mx-3">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="w-full relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-wheat/35 text-[18px] pointer-events-none">
                  search
                </span>
                <input
                  ref={searchRef}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={() => !search && setSearchOpen(false)}
                  placeholder="Search products, brands…"
                  className="w-full h-10 pl-10 pr-10 rounded-[10px] bg-white/[0.09] border border-white/[0.10] text-wheat text-[13.5px] placeholder:text-wheat/30 focus:outline-none focus:border-nectarine/50 focus:bg-white/[0.13] transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wheat/35 hover:text-wheat/70 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    close
                  </span>
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2.5 w-full h-10 px-3.5 rounded-[10px] bg-white/[0.07] border border-white/[0.08] text-wheat/35 text-[13px] hover:bg-white/[0.11] hover:text-wheat/50 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  search
                </span>
                <span>Search products…</span>
                <span className="ml-auto hidden xl:inline-flex items-center gap-1 text-[10px] font-mono bg-white/[0.07] border border-white/[0.10] rounded px-1.5 py-0.5 text-wheat/25">
                  ⌘K
                </span>
              </button>
            )}
          </div>

          {/* ── ACTIONS ─────────────────────────────────── */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Mobile search */}
            <button
              onClick={() => setSearchOpen((s) => !s)}
              className="md:hidden w-10 h-10 rounded-[10px] flex items-center justify-center text-wheat/55 hover:text-wheat hover:bg-white/[0.08] transition-all"
            >
              <span className="material-symbols-outlined text-[21px]">
                search
              </span>
            </button>

            {/* Wishlist */}
            <Link
              href="/dashboard/wishlist"
              className="hidden sm:flex w-10 h-10 rounded-[10px] items-center justify-center text-wheat/55 hover:text-wheat hover:bg-white/[0.08] transition-all"
              aria-label="Wishlist"
            >
              <span className="material-symbols-outlined text-[21px]">
                favorite
              </span>
            </Link>

            {/* Cart with badge */}
            <Link
              href="/cart"
              className="relative w-10 h-10 rounded-[10px] flex items-center justify-center text-wheat/55 hover:text-wheat hover:bg-white/[0.08] transition-all"
              aria-label="Cart"
            >
              <span className="material-symbols-outlined text-[21px]">
                shopping_cart
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] rounded-full bg-nectarine text-onyx text-[9.5px] font-black flex items-center justify-center px-1 anim-scale shadow-nectarine">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* ── User section ──────────────────────────── */}
            {!authLoaded ? (
              /* Loading skeleton — same size as the button */
              <div className="ml-1 w-20 h-9 rounded-[10px] bg-white/[0.07] animate-pulse" />
            ) : isLoggedIn ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className={cn(
                    "flex items-center gap-2 pl-1 pr-3 py-1 rounded-[10px] transition-all duration-150",
                    menuOpen ? "bg-white/12" : "hover:bg-white/[0.08]",
                  )}
                >
                  {/* Avatar — image if set, else initial */}
                  <div className="w-8 h-8 rounded-[9px] bg-nectarine flex items-center justify-center font-black text-onyx text-[13px] shadow-nectarine flex-shrink-0 overflow-hidden">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <span className="hidden sm:block text-[13px] font-semibold text-wheat/75 max-w-[80px] truncate">
                    {userName}
                  </span>
                  <span
                    className={cn(
                      "material-symbols-outlined text-[15px] text-wheat/35 transition-transform duration-200",
                      menuOpen && "rotate-180",
                    )}
                  >
                    expand_more
                  </span>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-modal border border-wheat-dark/80 overflow-hidden anim-scale origin-top-right z-50">
                    {/* Header */}
                    <div
                      className="px-4 py-3.5 flex items-center gap-3"
                      style={{
                        background: "linear-gradient(135deg,#003F47,#005566)",
                      }}
                    >
                      <div className="w-10 h-10 rounded-[11px] bg-nectarine/20 border border-nectarine/25 flex items-center justify-center font-black text-nectarine text-[15px] flex-shrink-0 overflow-hidden">
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          userInitial
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-wheat font-bold text-[13.5px] truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-wheat/45 text-[11px] truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="p-1.5 space-y-0.5">
                      {[
                        ...USER_MENU,
                        ...(user?.role === "admin"
                          ? [
                              {
                                icon: "admin_panel_settings",
                                label: "Admin Panel",
                                href: "/admin",
                              },
                            ]
                          : []),
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-[11px] text-[13px] text-onyx/70 hover:bg-wheat hover:text-onyx transition-colors group"
                        >
                          <span className="material-symbols-outlined text-[17px] text-oceanic/50 group-hover:text-oceanic transition-colors">
                            {item.icon}
                          </span>
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="px-1.5 pb-1.5 pt-0.5 border-t border-wheat-dark/70">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-[11px] text-[13px] text-red-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors mt-0.5"
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          logout
                        </span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="btn-primary ml-1 h-9 px-5 text-[13px]"
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden w-10 h-10 rounded-[10px] flex items-center justify-center text-wheat/55 hover:text-wheat hover:bg-white/[0.08] transition-all ml-0.5"
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[21px] transition-all duration-200",
                  mobileOpen && "rotate-90",
                )}
              >
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile search drawer */}
        {searchOpen && (
          <div className="md:hidden border-t border-white/[0.07] px-4 pb-3 bg-onyx/98">
            <form onSubmit={handleSearch} className="relative mt-3">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-wheat/35 text-[18px] pointer-events-none">
                search
              </span>
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                autoFocus
                className="w-full h-11 pl-10 pr-4 rounded-[11px] bg-white/[0.09] border border-white/[0.10] text-wheat text-[13.5px] placeholder:text-wheat/35 focus:outline-none focus:border-nectarine/50 transition-all"
              />
            </form>
          </div>
        )}

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/[0.07] px-4 py-3 space-y-1 bg-onyx-light/98 backdrop-blur-xl">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-[11px] text-[14px] font-medium transition-all",
                  pathname.startsWith(href.split("?")[0])
                    ? "bg-nectarine/12 text-nectarine"
                    : "text-wheat/60 hover:bg-white/[0.07] hover:text-wheat",
                )}
              >
                {label}
              </Link>
            ))}
            {!isLoggedIn && (
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full justify-center mt-2"
              >
                Sign In to VexonMart
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Fixed nav spacer */}
      <div style={{ height: "var(--nav-height)" }} aria-hidden="true" />

      {/* Dropdown backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
