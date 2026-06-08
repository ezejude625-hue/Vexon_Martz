"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatCurrency, getDiscountPercent } from "@/lib/utils";

function Stars({ count, size = "base" }) {
  const n = parseFloat(count) || 0;
  const sz = { xs: "text-xs", sm: "text-sm", base: "text-base", lg: "text-lg" }[
    size
  ];
  return (
    <div className="flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined ${sz} ${i <= Math.round(n) ? "text-nectarine-dark star-filled" : "text-onyx/15"}`}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [addingW, setAddingW] = useState(false);
  const [tab, setTab] = useState("description");

  const loadProduct = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success && data.data) setProduct(data.data);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    }
    setLoading(false);
  }, [id]);

  const checkWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      if (data.success) {
        setWishlisted(
          new Set((data.data || []).map((w) => w.product_id)).has(parseInt(id)),
        );
      }
    } catch {}
  }, [id]);

  useEffect(() => {
    loadProduct();
    checkWishlist();
  }, [loadProduct, checkWishlist]);

  async function addToCart() {
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity: qty }),
      });
      if (res.ok) window.dispatchEvent(new CustomEvent("cart:updated"));
    } catch {}
  }

  async function toggleWishlist() {
    if (!product) return;
    setAddingW(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id }),
      });
      const data = await res.json();
      if (data.success) setWishlisted(data.wishlisted);
    } catch {}
    setAddingW(false);
  }

  if (loading)
    return (
      <div className="min-h-screen bg-wheat flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-oceanic/30 animate-spin">
          progress_activity
        </span>
      </div>
    );

  if (notFound || !product)
    return (
      <div className="min-h-screen bg-wheat flex items-center justify-center text-center px-4">
        <div>
          <span className="material-symbols-outlined text-6xl text-onyx/12 block mb-3">
            inventory_2
          </span>
          <p className="font-bold text-onyx/40 text-lg mb-4">
            Product not found
          </p>
          <Link href="/shop" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );

  const p = product;
  const origPrice = parseFloat(p.price);
  const salePrice = p.salePrice ? parseFloat(p.salePrice) : null;
  const price = salePrice || origPrice;
  const discount = salePrice ? getDiscountPercent(origPrice, salePrice) : 0;
  const inStock = p.stock === -1 || p.stock > 0;
  const images = [p.thumbnailUrl, ...(p.images || [])].filter(Boolean);
  const rating = parseFloat(p.avgRating) || 0;
  const reviews = p.reviews || [];
  // Tags used as features — each tag becomes a feature bullet
  const features = p.tags || [];

  return (
    <div className="min-h-screen bg-wheat">
      {/* Breadcrumb */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-sm text-onyx/40 flex-wrap">
          {[
            { l: "Home", h: "/" },
            { l: "Shop", h: "/shop" },
            {
              l: p.category?.name || "Product",
              h: `/shop?category=${p.category?.slug || ""}`,
            },
          ].map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="material-symbols-outlined text-[14px] text-onyx/20">
                  chevron_right
                </span>
              )}
              <Link href={b.h} className="hover:text-oceanic transition-colors">
                {b.l}
              </Link>
            </span>
          ))}
          <span className="material-symbols-outlined text-[14px] text-onyx/20">
            chevron_right
          </span>
          <span className="text-onyx font-medium truncate max-w-[180px]">
            {p.name}
          </span>
        </nav>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* ── Image gallery ──────────────────────────────── */}
          <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            <div
              className="relative overflow-hidden rounded-3xl bg-white"
              style={{
                aspectRatio: "1/1",
                border: "1px solid #EDE3D2",
                boxShadow: "0 4px 24px rgba(10,23,29,0.08)",
              }}
            >
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={p.name}
                  className="w-full h-full object-cover transition-all duration-500"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-8xl text-onyx/10">
                    image
                  </span>
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span
                    className="px-3 py-1.5 rounded-full text-sm font-black bg-red-500 text-white"
                    style={{ boxShadow: "0 4px 12px rgba(239,68,68,0.4)" }}
                  >
                    -{discount}% OFF
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="relative aspect-square rounded-2xl overflow-hidden transition-all duration-200"
                    style={{
                      border: `2px solid ${activeImg === i ? "#003F47" : "#EDE3D2"}`,
                      boxShadow:
                        activeImg === i ? "0 0 0 3px rgba(0,63,71,0.15)" : "",
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {activeImg === i && (
                      <div className="absolute inset-0 bg-oceanic/10" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ───────────────────────────────── */}
          <div className="space-y-5">
            {p.category?.name && (
              <div className="inline-flex items-center gap-1.5 bg-oceanic/8 text-oceanic px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.08em]">
                <span className="material-symbols-outlined text-[14px]">
                  category
                </span>
                {p.category.name}
              </div>
            )}

            <h1
              className="text-onyx leading-tight"
              style={{
                fontFamily: '"Roboto Slab",sans-serif',
                fontWeight: 800,
                fontSize: "clamp(1.5rem,3vw,2rem)",
                letterSpacing: "-0.025em",
              }}
            >
              {p.name}
            </h1>

            {/* Rating row — always shown */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Stars count={rating} size="sm" />
                <span className="text-sm font-bold text-onyx">
                  {rating > 0 ? rating.toFixed(1) : "0.0"}
                </span>
                <span className="text-sm text-onyx/40">
                  ({(p.reviewCount || 0).toLocaleString()} reviews)
                </span>
              </div>
              {p.totalSales > 0 && (
                <>
                  <div className="w-px h-4 bg-onyx/15 hidden sm:block" />
                  <span className="text-sm text-onyx/40">
                    {p.totalSales.toLocaleString()} sold
                  </span>
                </>
              )}
            </div>

            {/* Price */}
            <div
              className="flex items-baseline gap-4 py-5 border-t border-b"
              style={{ borderColor: "#EDE3D2" }}
            >
              <span
                className="text-4xl font-black text-oceanic tabular-nums"
                style={{ fontFamily: '"Roboto Slab",sans-serif' }}
              >
                {formatCurrency(price)}
              </span>
              {salePrice && (
                <>
                  <span className="text-xl text-onyx/30 line-through tabular-nums">
                    {formatCurrency(origPrice)}
                  </span>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200">
                    <span className="material-symbols-outlined text-red-500 text-[14px]">
                      local_offer
                    </span>
                    <span className="text-red-600 text-xs font-black">
                      Save {formatCurrency(origPrice - price)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Stock */}
            <div
              className={`flex items-center gap-2 text-sm font-semibold ${inStock ? "text-emerald-600" : "text-red-500"}`}
            >
              <div className="relative">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ background: inStock ? "#22c55e" : "#ef4444" }}
                />
                {inStock && (
                  <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
                )}
              </div>
              {inStock
                ? p.stock === -1
                  ? "In stock — unlimited"
                  : `In stock — ${p.stock} units remaining`
                : "Out of stock"}
            </div>

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center rounded-xl overflow-hidden"
                style={{ border: "1.5px solid #E2D5C0" }}
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-11 h-12 flex items-center justify-center text-onyx/50 hover:text-onyx hover:bg-wheat-dark transition-all duration-150"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    remove
                  </span>
                </button>
                <span className="w-12 text-center font-bold text-onyx text-base tabular-nums">
                  {qty}
                </span>
                <button
                  onClick={() =>
                    setQty((q) =>
                      p.stock === -1 ? q + 1 : Math.min(p.stock, q + 1),
                    )
                  }
                  className="w-11 h-12 flex items-center justify-center text-onyx/50 hover:text-onyx hover:bg-wheat-dark transition-all duration-150"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                </button>
              </div>

              <button
                onClick={addToCart}
                disabled={!inStock}
                className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2.5 text-sm font-bold transition-all duration-300 ${added ? "bg-emerald-500 text-white" : "btn-primary"}`}
                style={{
                  boxShadow: added ? "0 4px 20px rgba(34,197,94,0.4)" : "",
                }}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {added ? "check_circle" : "add_shopping_cart"}
                </span>
                {added ? "Added to Cart!" : "Add to Cart"}
              </button>

              <button
                onClick={toggleWishlist}
                disabled={addingW}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  border: `1.5px solid ${wishlisted ? "#fca5a5" : "#E2D5C0"}`,
                  background: wishlisted ? "#fee2e2" : "#fff",
                  color: wishlisted ? "#ef4444" : "#9AAAB5",
                }}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${wishlisted ? "star-filled" : ""}`}
                >
                  favorite
                </span>
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  icon: "verified_user",
                  label: "Secure",
                  sub: "SSL protected",
                },
                {
                  icon: "local_shipping",
                  label: "Fast",
                  sub: "Express delivery",
                },
                { icon: "replay", label: "Returns", sub: "30-day policy" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center"
                  style={{ background: "#F5EBD8", border: "1px solid #E2D5C0" }}
                >
                  <span className="material-symbols-outlined text-oceanic text-xl">
                    {b.icon}
                  </span>
                  <div>
                    <p className="text-[11px] font-bold text-onyx">{b.label}</p>
                    <p className="text-[10px] text-onyx/40">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Seller */}
            {p.seller && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: "#F5EBD8", border: "1px solid #E2D5C0" }}
              >
                <div className="w-11 h-11 rounded-xl bg-oceanic/12 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-oceanic text-xl">
                    storefront
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-onyx text-sm">
                    {p.seller.firstName} {p.seller.lastName}
                  </p>
                  <p className="text-xs text-onyx/45 mt-0.5">
                    {p.seller.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div
          className="bg-white rounded-3xl overflow-hidden"
          style={{
            border: "1px solid #EDE3D2",
            boxShadow: "0 2px 16px rgba(10,23,29,0.06)",
          }}
        >
          <div className="flex border-b" style={{ borderColor: "#EDE3D2" }}>
            {[
              { key: "description", label: "Description", icon: "description" },
              { key: "features", label: "Features", icon: "checklist" },
              {
                key: "reviews",
                label: `Reviews (${(p.reviewCount || 0).toLocaleString()})`,
                icon: "rate_review",
              },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-200 border-b-2"
                style={{
                  borderColor: tab === t.key ? "#003F47" : "transparent",
                  color: tab === t.key ? "#003F47" : "#6B7D8A",
                  background:
                    tab === t.key ? "rgba(0,63,71,0.04)" : "transparent",
                }}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {t.icon}
                </span>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {/* Description */}
            {tab === "description" && (
              <div>
                {p.description ? (
                  <p className="text-onyx/65 leading-relaxed text-base max-w-2xl">
                    {p.description}
                  </p>
                ) : (
                  <p className="text-onyx/35 italic text-sm">
                    No description available.
                  </p>
                )}
                {p.shortDesc && (
                  <p
                    className="text-onyx/50 text-sm mt-3 leading-relaxed border-t pt-3"
                    style={{ borderColor: "#EDE3D2" }}
                  >
                    {p.shortDesc}
                  </p>
                )}
              </div>
            )}

            {/* Features — tags as bullet points */}
            {tab === "features" && (
              <ul className="space-y-3 max-w-lg">
                {features.length > 0 ? (
                  features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-emerald-600 text-[14px] material-symbols-filled">
                          check
                        </span>
                      </div>
                      <span className="text-onyx/75 text-sm">{f}</span>
                    </li>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-onyx/12 block mb-2">
                      checklist
                    </span>
                    <p className="text-onyx/35 italic text-sm">
                      No features listed yet.
                    </p>
                    <p className="text-[11px] text-onyx/25 mt-1">
                      Admin can add tags to this product to populate this
                      section.
                    </p>
                  </div>
                )}
              </ul>
            )}

            {/* Reviews */}
            {tab === "reviews" && (
              <div>
                {rating > 0 && (
                  <div
                    className="flex items-center gap-8 mb-8 pb-8 border-b"
                    style={{ borderColor: "#EDE3D2" }}
                  >
                    <div className="text-center">
                      <p
                        className="text-7xl font-black text-onyx tabular-nums"
                        style={{
                          fontFamily: '"Roboto Slab",sans-serif',
                          letterSpacing: "-0.04em",
                        }}
                      >
                        {rating.toFixed(1)}
                      </p>
                      <Stars count={rating} size="base" />
                      <p className="text-xs text-onyx/40 mt-1">
                        {(p.reviewCount || 0).toLocaleString()} reviews
                      </p>
                    </div>
                    <div className="flex-1 space-y-2 max-w-xs">
                      {[5, 4, 3, 2, 1].map((n) => (
                        <div
                          key={n}
                          className="flex items-center gap-2.5 text-sm"
                        >
                          <span className="w-3 text-onyx/40 text-right text-xs">
                            {n}
                          </span>
                          <span className="material-symbols-outlined text-nectarine-dark text-sm star-filled">
                            star
                          </span>
                          <div
                            className="flex-1 h-2 rounded-full overflow-hidden"
                            style={{ background: "#EDE3D2" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${n === 5 ? 70 : n === 4 ? 20 : n === 3 ? 7 : 2}%`,
                                background: "#FFBD76",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="pb-6 border-b last:border-0 last:pb-0"
                        style={{ borderColor: "#F2EAE0" }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-oceanic/10 flex items-center justify-center font-bold text-oceanic text-sm shrink-0">
                            {r.user?.firstName?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-onyx text-sm">
                                {r.user?.firstName} {r.user?.lastName}
                              </p>
                              <span className="text-xs text-onyx/35">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <Stars count={r.rating} size="xs" />
                          </div>
                        </div>
                        {r.title && (
                          <p className="font-semibold text-onyx text-sm mb-1">
                            {r.title}
                          </p>
                        )}
                        {r.body && (
                          <p className="text-sm text-onyx/60 leading-relaxed">
                            {r.body}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-5xl text-onyx/12 block mb-3">
                      rate_review
                    </span>
                    <p className="text-onyx/35 text-sm italic">
                      No reviews yet — be the first!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
