"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatCurrency, getDiscountPercent } from "@/lib/utils";

// ── Icon map for DB categories ─────────────────────────────
const ICON_MAP = {
  all: "apps",
  electronics: "devices",
  fashion: "checkroom",
  "home-living": "chair",
  sports: "sports",
  beauty: "spa",
  books: "menu_book",
  "digital-goods": "download",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low–High" },
  { value: "price_desc", label: "Price: High–Low" },
  { value: "rating", label: "Top Rated" },
];

const BADGE_STYLE = {
  Sale: "bg-red-500 text-white",
  "Hot Deal": "bg-nectarine text-onyx",
  New: "bg-emerald-500 text-white",
};

// ── Normalize DB product → shape the JSX already uses ─────
function normalize(p) {
  return {
    id: p.id,
    name: p.name,
    cat: p.category?.slug || "",
    catName: p.category?.name || "",
    price: parseFloat(p.price),
    sale: p.salePrice ? parseFloat(p.salePrice) : null,
    img: p.thumbnailUrl || "",
    rating: parseFloat(p.avgRating) || 0,
    reviews: p.reviewCount || 0,
    badge: p.salePrice
      ? "Sale"
      : p.isFeatured
        ? "Hot Deal"
        : Date.now() - new Date(p.createdAt).getTime() <
            30 * 24 * 60 * 60 * 1000
          ? "New"
          : null,
  };
}

function StarRow({ count }) {
  return (
    <div className="flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[13px] ${
            i <= Math.round(count)
              ? "text-nectarine-dark star-filled"
              : "text-onyx/15"
          }`}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function ShopPage() {
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("newest");
  const [maxPrice, setMaxPrice] = useState(500);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState("grid");
  const [addedIds, setAddedIds] = useState([]);

  // ── DB state ──────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [dbCats, setDbCats] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);

  // ── Build CATEGORIES in original shape from DB data ───────
  const CATEGORIES = useMemo(
    () => [
      { slug: "all", label: "All Products", count: grandTotal, icon: "apps" },
      ...dbCats.map((c) => ({
        slug: c.slug,
        label: c.name,
        count: c.totalStock,
        icon: ICON_MAP[c.slug] || c.icon || "category",
      })),
    ],
    [dbCats, grandTotal],
  );

  // ── Fetch categories with stock counts ────────────────────
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setDbCats(d.data || []);
          setGrandTotal(d.grandTotal || 0);
        }
      })
      .catch(() => {});
  }, []);

  // ── Fetch wishlist IDs ────────────────────────────────────
  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((d) => {
        if (d.success)
          setWishlistIds(new Set((d.data || []).map((w) => w.product_id)));
      })
      .catch(() => {});
  }, []);

  // ── Fetch products from DB ────────────────────────────────
  const loadProducts = useCallback(
    async (pg) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pg || page,
          limit: 12,
          sort,
        });
        if (cat !== "all") params.set("category", cat);
        if (search.trim()) params.set("q", search.trim());
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        if (data.success) {
          setProducts((data.data || []).map(normalize));
          setPagination(data.pagination || { total: 0, pages: 1, page: 1 });
        }
      } catch {}
      setLoading(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [cat, sort, search],
  );

  // Reset page + fetch when filters change
  useEffect(() => {
    setPage(1);
    loadProducts(1);
  }, [cat, sort, search, loadProducts]);

  // Fetch when page changes
  useEffect(() => {
    loadProducts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ── Add to cart — API, optimistic feedback ────────────────
  async function handleAddToCart(e, p) {
    e.preventDefault();
    e.stopPropagation();
    // Optimistic — show immediately
    setAddedIds((prev) => [...prev, p.id]);
    setTimeout(
      () => setAddedIds((prev) => prev.filter((id) => id !== p.id)),
      1500,
    );
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: p.id, quantity: 1 }),
      });
      if (res.ok) window.dispatchEvent(new CustomEvent("cart:updated"));
    } catch {}
  }

  // ── Toggle wishlist — API ─────────────────────────────────
  async function toggleWishlist(id) {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          data.wishlisted ? next.add(id) : next.delete(id);
          return next;
        });
      }
    } catch {}
  }

  // ── Client-side price filter on top of server results ─────
  const filtered = useMemo(
    () => products.filter((p) => (p.sale || p.price) <= maxPrice),
    [products, maxPrice],
  );

  // ── FilterPanel — original JSX, zero changes ──────────────
  const FilterPanel = () => (
    <div className="space-y-7">
      <div>
        <p className="text-[11px] font-bold text-onyx/35 uppercase tracking-[0.1em] mb-3">
          Categories
        </p>
        <div className="space-y-0.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCat(c.slug)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150"
              style={{
                background: cat === c.slug ? "#003F47" : "transparent",
                color: cat === c.slug ? "#FFF6E9" : "#3D5060",
              }}
              onMouseEnter={(e) => {
                if (cat !== c.slug)
                  e.currentTarget.style.background = "#F5EBD8";
              }}
              onMouseLeave={(e) => {
                if (cat !== c.slug)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ color: cat === c.slug ? "#FFBD76" : undefined }}
              >
                {c.icon}
              </span>
              <span className="font-medium flex-1 text-left">{c.label}</span>
              <span className="text-[11px] font-semibold opacity-50">
                {c.count > 0 ? c.count.toLocaleString() : ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-onyx/35 uppercase tracking-[0.1em]">
            Max Price
          </p>
          <span className="text-sm font-bold text-oceanic">
            {formatCurrency(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={maxPrice}
          onChange={(e) => setMaxPrice(+e.target.value)}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: "#003F47" }}
        />
        <div className="flex justify-between text-[11px] text-onyx/30 font-medium mt-1.5">
          <span>$10</span>
          <span>$500</span>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold text-onyx/35 uppercase tracking-[0.1em] mb-3">
          Min Rating
        </p>
        <div className="space-y-1.5">
          {[4.5, 4.0, 3.5].map((r) => (
            <button
              key={r}
              className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-xl text-sm text-onyx/55 hover:bg-wheat-dark hover:text-onyx transition-all"
            >
              <div className="flex gap-px">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`material-symbols-outlined text-xs ${i <= Math.round(r) ? "text-nectarine-dark star-filled" : "text-onyx/15"}`}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="font-medium">{r}+ stars</span>
            </button>
          ))}
        </div>
      </div>

      {(cat !== "all" || maxPrice < 500 || search) && (
        <button
          onClick={() => {
            setCat("all");
            setMaxPrice(500);
            setSearch("");
          }}
          className="w-full py-2 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-all duration-150"
        >
          <span className="material-symbols-outlined text-[16px] align-middle mr-1">
            close
          </span>
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-wheat">
      {/* Header */}
      <div className="bg-onyx py-12 px-4 text-center relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 50%,rgba(255,189,118,0.08) 0%,transparent 55%)",
          }}
        />
        <div className="relative">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.12em] mb-2">
            {loading
              ? "Loading…"
              : `${pagination.total.toLocaleString()} products available`}
          </p>
          <h1
            className="text-white"
            style={{
              fontFamily: '"Roboto Slab",sans-serif',
              fontWeight: 800,
              fontSize: "clamp(1.75rem,4vw,2.5rem)",
              letterSpacing: "-0.025em",
            }}
          >
            All Products
          </h1>
          <p className="text-white/40 text-sm mt-2">
            {cat !== "all"
              ? CATEGORIES.find((c) => c.slug === cat)?.label
              : "Browse our complete collection"}
          </p>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div
              className="bg-white rounded-2xl p-5 sticky top-24"
              style={{
                border: "1px solid #EDE3D2",
                boxShadow: "0 2px 12px rgba(10,23,29,0.06)",
              }}
            >
              <p
                className="font-bold text-onyx mb-5"
                style={{ fontFamily: '"Roboto Slab",sans-serif' }}
              >
                Filters
              </p>
              <FilterPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Controls */}
            <div
              className="flex flex-wrap items-center gap-3 mb-6 bg-white rounded-2xl px-4 py-3"
              style={{
                border: "1px solid #EDE3D2",
                boxShadow: "0 2px 8px rgba(10,23,29,0.05)",
              }}
            >
              <button
                onClick={() => setFiltersOpen((s) => !s)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-onyx/60 border border-wheat-dark hover:bg-wheat transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  tune
                </span>
                Filters
                {(cat !== "all" || maxPrice < 500) && (
                  <span className="w-2 h-2 rounded-full bg-oceanic inline-block" />
                )}
              </button>

              <div className="relative flex-1 min-w-[160px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-onyx/30 text-[18px] pointer-events-none">
                  search
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "#F5EBD8",
                    border: "1.5px solid transparent",
                    color: "#0A171D",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#003F47";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0,63,71,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "transparent";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 px-3 rounded-xl text-sm font-medium border outline-none cursor-pointer"
                style={{
                  background: "#fff",
                  borderColor: "#E2D5C0",
                  color: "#3D5060",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <div className="flex border border-wheat-dark rounded-xl overflow-hidden shrink-0">
                {["grid", "list"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className="w-9 h-9 flex items-center justify-center transition-all duration-150"
                    style={{
                      background: view === v ? "#003F47" : "transparent",
                      color: view === v ? "#FFF6E9" : "#9AAAB5",
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {v === "grid" ? "grid_view" : "list"}
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-sm text-onyx/40 font-medium hidden sm:block ml-auto">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Mobile filter drawer */}
            {filtersOpen && (
              <div
                className="lg:hidden bg-white rounded-2xl p-5 mb-4 animate-scale-in"
                style={{
                  border: "1px solid #EDE3D2",
                  boxShadow: "0 4px 20px rgba(10,23,29,0.10)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p
                    className="font-bold text-onyx"
                    style={{ fontFamily: '"Roboto Slab",sans-serif' }}
                  >
                    Filters
                  </p>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-wheat text-onyx/40"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      close
                    </span>
                  </button>
                </div>
                <FilterPanel />
              </div>
            )}

            {/* Loading skeletons */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden animate-pulse"
                    style={{ border: "1px solid #EDE3D2" }}
                  >
                    <div className="h-48 bg-wheat-dark" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-wheat-dark rounded w-1/3" />
                      <div className="h-4 bg-wheat-dark rounded w-4/5" />
                      <div className="h-3 bg-wheat-dark rounded w-2/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="text-center py-24 bg-white rounded-2xl"
                style={{ border: "1px solid #EDE3D2" }}
              >
                <span className="material-symbols-outlined text-6xl text-onyx/15 block mb-3">
                  search_off
                </span>
                <p className="font-bold text-onyx/35 text-base">
                  No products found
                </p>
                <p className="text-sm text-onyx/25 mt-1">
                  Try adjusting your filters or search term
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setCat("all");
                    setMaxPrice(500);
                  }}
                  className="btn-secondary mt-5 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : view === "grid" ? (
              /* ══ GRID VIEW — original JSX, zero changes ══ */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 stagger-grid">
                {filtered.map((p) => {
                  const eff = p.sale || p.price;
                  const disc = p.sale ? getDiscountPercent(p.price, p.sale) : 0;
                  const wl = wishlistIds.has(p.id);
                  const justAdded = addedIds.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl overflow-hidden flex flex-col group"
                      style={{
                        border: "1px solid #EDE3D2",
                        boxShadow: "0 2px 10px rgba(10,23,29,0.06)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 36px rgba(10,23,29,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 10px rgba(10,23,29,0.06)";
                      }}
                    >
                      {/* Image */}
                      <div
                        className="relative overflow-hidden bg-wheat-faint"
                        style={{ aspectRatio: "4/3" }}
                      >
                        {p.img ? (
                          <img
                            src={p.img}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-onyx/10">
                              image
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-onyx/30 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          {p.badge && (
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${BADGE_STYLE[p.badge]}`}
                            >
                              {p.badge}
                            </span>
                          )}
                          {disc > 0 && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-onyx/80 text-white backdrop-blur-sm">
                              -{disc}%
                            </span>
                          )}
                        </div>

                        {/* Hover quick actions */}
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex gap-1.5">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(p.id);
                            }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-200"
                            style={{
                              background: "rgba(255,255,255,0.9)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                              color: wl ? "#ef4444" : "#6B7D8A",
                            }}
                          >
                            <span
                              className={`material-symbols-outlined text-[17px] ${wl ? "star-filled" : ""}`}
                            >
                              favorite
                            </span>
                          </button>
                          <button
                            onClick={(e) => handleAddToCart(e, p)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                            style={{
                              background: justAdded ? "#22c55e" : "#FFBD76",
                              color: "#0A171D",
                              boxShadow: justAdded
                                ? "0 4px 12px rgba(34,197,94,0.4)"
                                : "0 4px 12px rgba(255,189,118,0.4)",
                            }}
                            title={justAdded ? "Added!" : "Add to cart"}
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              {justAdded ? "check" : "add_shopping_cart"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Card info */}
                      <div className="p-4 flex flex-col flex-1">
                        <p className="text-[10px] font-bold text-oceanic/60 uppercase tracking-[0.08em] mb-1.5">
                          {p.catName || p.cat.replace(/-/g, " ")}
                        </p>
                        <Link
                          href={`/products/${p.id}`}
                          className="font-semibold text-onyx text-sm leading-snug line-clamp-2 flex-1 hover:text-oceanic transition-colors duration-200 mb-2.5"
                        >
                          {p.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mb-3">
                          <StarRow count={p.rating} />
                          <span className="text-[11px] text-onyx/40 font-medium">
                            {p.rating > 0
                              ? `${p.rating.toFixed(1)} (${p.reviews.toLocaleString()})`
                              : "No reviews yet"}
                          </span>
                        </div>
                        <div
                          className="flex items-center justify-between pt-3 border-t"
                          style={{ borderColor: "#F2EAE0" }}
                        >
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-black text-oceanic tabular-nums">
                              {formatCurrency(eff)}
                            </span>
                            {p.sale && (
                              <span className="text-xs text-onyx/30 line-through tabular-nums">
                                {formatCurrency(p.price)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => handleAddToCart(e, p)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300"
                            style={{
                              background: justAdded ? "#22c55e" : "#003F47",
                              color: "#FFF6E9",
                            }}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {justAdded ? "check" : "add"}
                            </span>
                            {justAdded ? "Added!" : "Add"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ══ LIST VIEW — original JSX, zero changes ══ */
              <div className="space-y-3">
                {filtered.map((p) => {
                  const eff = p.sale || p.price;
                  const disc = p.sale ? getDiscountPercent(p.price, p.sale) : 0;
                  const justAdded = addedIds.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl overflow-hidden flex gap-4 p-4 group"
                      style={{
                        border: "1px solid #EDE3D2",
                        boxShadow: "0 2px 8px rgba(10,23,29,0.05)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 6px 24px rgba(10,23,29,0.10)";
                        e.currentTarget.style.borderColor = "#C8B89A";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(10,23,29,0.05)";
                        e.currentTarget.style.borderColor = "#EDE3D2";
                      }}
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-wheat-faint shrink-0">
                        {p.img ? (
                          <img
                            src={p.img}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-onyx/10">
                              image
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-oceanic/60 uppercase tracking-[0.08em] mb-0.5">
                            {p.catName || p.cat.replace(/-/g, " ")}
                          </p>
                          <Link
                            href={`/products/${p.id}`}
                            className="font-semibold text-onyx text-sm hover:text-oceanic transition-colors line-clamp-1"
                          >
                            {p.name}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-1">
                            <StarRow count={p.rating} />
                            <span className="text-[11px] text-onyx/40">
                              {p.rating > 0
                                ? p.rating.toFixed(1)
                                : "No reviews"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-baseline gap-2">
                            <span className="font-black text-oceanic tabular-nums">
                              {formatCurrency(eff)}
                            </span>
                            {p.sale && (
                              <span className="text-xs text-onyx/30 line-through">
                                {formatCurrency(p.price)}
                              </span>
                            )}
                            {disc > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-600">
                                -{disc}%
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => handleAddToCart(e, p)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300"
                            style={{
                              background: justAdded ? "#22c55e" : "#003F47",
                              color: "#FFF6E9",
                              boxShadow: justAdded
                                ? "0 2px 8px rgba(34,197,94,0.35)"
                                : "",
                            }}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {justAdded ? "check" : "add"}
                            </span>
                            {justAdded ? "Added!" : "Add"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination — only shows when DB has more than one page */}
            {!loading && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    border: "1.5px solid #E2D5C0",
                    background: page === 1 ? "#F5EBD8" : "#fff",
                    opacity: page === 1 ? 0.5 : 1,
                  }}
                >
                  <span className="material-symbols-outlined text-[18px] text-onyx/60">
                    chevron_left
                  </span>
                </button>
                {Array.from(
                  { length: Math.min(5, pagination.pages) },
                  (_, i) => i + 1,
                ).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className="w-10 h-10 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: page === n ? "#003F47" : "#fff",
                      color: page === n ? "#FFF6E9" : "#3D5060",
                      border: "1.5px solid #E2D5C0",
                      boxShadow:
                        page === n ? "0 2px 8px rgba(0,63,71,0.3)" : "",
                    }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.pages, p + 1))
                  }
                  disabled={page === pagination.pages}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    border: "1.5px solid #E2D5C0",
                    background: page === pagination.pages ? "#F5EBD8" : "#fff",
                    opacity: page === pagination.pages ? 0.5 : 1,
                  }}
                >
                  <span className="material-symbols-outlined text-[18px] text-onyx/60">
                    chevron_right
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
