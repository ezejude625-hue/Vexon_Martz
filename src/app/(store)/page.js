"use client";
// ============================================================
// HOME PAGE — src/app/(store)/page.js
// ============================================================

import Link from "next/link";
import { formatCurrency, getDiscountPercent } from "@/lib/utils";

// ── Data ─────────────────────────────────────────────────────

const CATEGORIES = [
  {
    name: "Electronics",
    icon: "devices",
    slug: "electronics",
    count: 1240,
    color: "bg-blue-500/12 text-blue-400",
  },
  {
    name: "Fashion",
    icon: "checkroom",
    slug: "fashion",
    count: 3800,
    color: "bg-pink-500/12 text-pink-400",
  },
  {
    name: "Home & Living",
    icon: "chair",
    slug: "home-living",
    count: 920,
    color: "bg-amber-500/12 text-amber-400",
  },
  {
    name: "Sports",
    icon: "sports",
    slug: "sports",
    count: 640,
    color: "bg-green-500/12 text-green-400",
  },
  {
    name: "Beauty",
    icon: "spa",
    slug: "beauty",
    count: 510,
    color: "bg-rose-500/12 text-rose-400",
  },
  {
    name: "Books",
    icon: "menu_book",
    slug: "books",
    count: 780,
    color: "bg-violet-500/12 text-violet-400",
  },
  {
    name: "Digital",
    icon: "download",
    slug: "digital-goods",
    count: 200,
    color: "bg-cyan-500/12 text-cyan-400",
  },
  {
    name: "Toys & Kids",
    icon: "toys",
    slug: "toys-kids",
    count: 390,
    color: "bg-orange-500/12 text-orange-400",
  },
];

const FEATURED = [
  {
    id: 1,
    name: "Sony WH-1000XM5 Headphones",
    category: "Electronics",
    price: 349.99,
    sale: 279.99,
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=85&fit=crop",
    rating: 4.8,
    reviews: 1204,
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Premium Leather High-Tops",
    category: "Fashion",
    price: 189.99,
    sale: 149.99,
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=85&fit=crop",
    rating: 4.6,
    reviews: 830,
    badge: "Sale",
  },
  {
    id: 3,
    name: "Minimalist Arc Desk Lamp",
    category: "Home",
    price: 89.99,
    sale: null,
    img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=85&fit=crop",
    rating: 4.7,
    reviews: 412,
    badge: "New",
  },
  {
    id: 4,
    name: "React 19 Mastery Course",
    category: "Digital",
    price: 149.0,
    sale: 49.0,
    img: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&q=85&fit=crop",
    rating: 4.9,
    reviews: 3280,
    badge: "Hot",
  },
];

const HOW = [
  {
    icon: "manage_search",
    step: "01",
    title: "Browse",
    desc: "Explore thousands of curated products across every category you love.",
  },
  {
    icon: "add_shopping_cart",
    step: "02",
    title: "Add",
    desc: "Smart cart keeps everything organised. Quantity controls, saved carts.",
  },
  {
    icon: "lock",
    step: "03",
    title: "Pay",
    desc: "Bank-grade encryption. Visa, Mastercard, PayPal, and more accepted.",
  },
  {
    icon: "local_shipping",
    step: "04",
    title: "Receive",
    desc: "Real-time tracking from our warehouse directly to your front door.",
  },
];

const TESTIMONIALS = [
  {
    name: "Amara Osei",
    role: "Lagos, Nigeria",
    avatar: "A",
    stars: 5,
    text: "VexonMart is my go-to for everything. Prices are unbeatable and delivery is always on time. Never going back to any other store!",
  },
  {
    name: "Lucas Ferreira",
    role: "São Paulo, Brazil",
    avatar: "L",
    stars: 5,
    text: "Product quality matched exactly what was shown online. Customer service resolved my query in under 10 minutes. Exceptional experience.",
  },
  {
    name: "Priya Mehta",
    role: "Mumbai, India",
    avatar: "P",
    stars: 4,
    text: "I love how easy it is to find deals. Saved over $200 last month alone. The category filters are incredibly smart and intuitive.",
  },
];

const STATS = [
  { value: "50K+", label: "Products", icon: "inventory_2" },
  { value: "2M+", label: "Customers", icon: "group" },
  { value: "180+", label: "Countries", icon: "public" },
  { value: "4.9★", label: "Avg Rating", icon: "star" },
];

const BADGE_COLOR = {
  "Best Seller": "bg-oceanic text-wheat",
  Sale: "bg-red-500 text-white",
  New: "bg-emerald-500 text-white",
  Hot: "bg-nectarine text-onyx",
};

// ── Helper components ─────────────────────────────────────────

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[13px] ${i <= Math.round(count) ? "text-nectarine material-symbols-filled" : "text-onyx/15"}`}
        >
          star
        </span>
      ))}
    </div>
  );
}

function ProductCard({ p }) {
  const effectivePrice = p.sale || p.price;
  const discount = p.sale ? getDiscountPercent(p.price, p.sale) : 0;

  // ── Add to cart ──────────────────────────────────────────
  async function addToCart(e) {
    e.preventDefault();

    const btn = e.currentTarget;
    if (!btn) return;

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: Number(p.id), quantity: 1 }),
      });

      if (!res.ok) throw new Error("Failed to add to cart");

      window.dispatchEvent(new CustomEvent("cart:updated"));

      const originalHTML = btn.innerHTML;
      btn.innerHTML =
        '<span class="material-symbols-outlined text-[16px]">check_circle</span> Added!';
      btn.style.background = "#22c55e";

      setTimeout(() => {
        if (btn) {
          btn.innerHTML = originalHTML;
          btn.style.background = "";
        }
      }, 1500);
    } catch (err) {
      console.error("Cart error:", err);
    }
  }

  return (
    <Link href={`/products/${p.id}`} className="product-card group">
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <img
          src={p.img}
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {p.badge && (
          <span
            className={`absolute top-3 left-3 badge text-[11px] font-bold ${BADGE_COLOR[p.badge]}`}
          >
            {p.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 badge bg-red-500 text-white text-[11px] font-bold">
            -{discount}%
          </span>
        )}

        {/* ── Add to Cart button — now actually works ── */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={addToCart}
            className="btn-primary w-full justify-center h-10 text-[13px] transition-all duration-300"
          >
            <span className="material-symbols-outlined text-[16px]">
              add_shopping_cart
            </span>
            Add to Cart
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] text-oceanic/60 font-semibold uppercase tracking-[0.08em] mb-1.5">
          {p.category}
        </p>
        <h3 className="font-semibold text-onyx text-[14px] leading-snug line-clamp-2 flex-1 mb-3 group-hover:text-oceanic transition-colors">
          {p.name}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <Stars count={p.rating} />
          <span className="text-[12px] font-semibold text-onyx/40">
            {p.rating}
          </span>
          <span className="text-[11px] text-onyx/30">
            ({p.reviews.toLocaleString()})
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span
              className="text-[20px] font-black text-oceanic leading-none"
              style={{ fontFamily: "'Roboto Slab',sans-serif" }}
            >
              {formatCurrency(effectivePrice)}
            </span>
            {p.sale && (
              <span className="text-[12px] text-onyx/35 line-through">
                {formatCurrency(p.price)}
              </span>
            )}
          </div>

          {/* ── Wishlist button ── */}
          <button
            onClick={(e) => e.preventDefault()}
            className="w-9 h-9 rounded-[10px] bg-oceanic/8 text-oceanic flex items-center justify-center hover:bg-oceanic hover:text-wheat transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[16px]">
              favorite_border
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function HomePage() {
  // Newsletter submit — works because 'use client' is at the very top of this file
  function handleSubmit(e) {
    e.preventDefault();
    alert("Subscribed! Thank you.");
  }

  return (
    <div className="overflow-x-hidden">
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%,rgba(0,85,102,0.55) 0%,transparent 70%),radial-gradient(ellipse 60% 50% at 90% 80%,rgba(255,189,118,0.15) 0%,transparent 65%),linear-gradient(155deg,#060E11 0%,#0A171D 45%,#13232C 100%)",
        }}
      >
        {/* Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
          <div className="w-[700px] h-[700px] rounded-full border border-white/[0.035] absolute inset-0 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" />
          <div className="w-[500px] h-[500px] rounded-full border border-white/[0.05]  absolute inset-0 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" />
          <div className="w-[320px] h-[320px] rounded-full border border-oceanic/25    absolute inset-0 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" />
        </div>

        {/* Floating thumbnails */}
        <div
          className="absolute top-[20%]   right-[8%]  w-28 h-28 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(10,23,29,0.7)] border border-white/10 hidden lg:block animate-float"
          style={{ animationDelay: "0s" }}
        >
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="absolute bottom-[25%] right-[12%] w-24 h-24 rounded-2xl overflow-hidden shadow-[0_16px_50px_rgba(10,23,29,0.7)] border border-white/10 hidden lg:block animate-float"
          style={{ animationDelay: "1.4s" }}
        >
          <img
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="absolute top-[30%]   left-[6%]   w-24 h-24 rounded-2xl overflow-hidden shadow-[0_16px_50px_rgba(10,23,29,0.7)] border border-white/10 hidden xl:block animate-float"
          style={{ animationDelay: "0.7s" }}
        >
          <img
            src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=85&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="absolute bottom-[28%] left-[9%]  w-20 h-20 rounded-2xl overflow-hidden shadow-[0_14px_40px_rgba(10,23,29,0.7)] border border-white/10 hidden xl:block animate-float"
          style={{ animationDelay: "2s" }}
        >
          <img
            src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=200&q=80&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-7 lg:px-8 text-center py-24">
          <div className="inline-flex items-center gap-2 bg-nectarine/12 border border-nectarine/22 rounded-full px-5 py-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-nectarine animate-ping" />
            <span className="text-nectarine text-[12.5px] font-semibold tracking-[0.08em] uppercase">
              New arrivals every week
            </span>
          </div>

          <h1
            className="text-[clamp(44px,8vw,96px)] font-black leading-[0.95] tracking-[-0.04em] mb-6"
            style={{ fontFamily: "'Roboto Slab',system-ui,sans-serif" }}
          >
            <span className="text-white">Shop </span>
            <span
              style={{
                background:
                  "linear-gradient(135deg,#FFD4A3 0%,#FFBD76 50%,#E8A355 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Smarter.
            </span>
            <br />
            <span className="text-white">Live </span>
            <span
              style={{
                background:
                  "linear-gradient(135deg,#FFD4A3 0%,#FFBD76 50%,#E8A355 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Better.
            </span>
          </h1>

          <p className="text-white/50 text-[clamp(16px,2.2vw,20px)] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Discover premium products across every category. Electronics,
            fashion, digital goods — delivered fast, priced right.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link href="/shop" className="btn-primary text-base px-9 h-14">
              <span className="material-symbols-outlined text-[18px]">
                storefront
              </span>
              Browse the Store
            </Link>
            <Link
              href="/shop?filter=sale"
              className="btn-ghost-light text-base px-8 h-14"
            >
              <span className="material-symbols-outlined text-[18px]">
                local_offer
              </span>
              View Deals
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="card-glass rounded-2xl py-5 px-4 text-center"
              >
                <span className="material-symbols-outlined text-nectarine text-[18px] mb-1 block">
                  {s.icon}
                </span>
                <p
                  className="text-2xl font-black text-white"
                  style={{ fontFamily: "'Roboto Slab',sans-serif" }}
                >
                  {s.value}
                </p>
                <p className="text-[11.5px] text-white/40 font-medium mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CATEGORIES ════════════════════════════════════════ */}
      <section className="py-24 px-5 sm:px-7 lg:px-8 bg-wheat">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-oceanic/60 text-[12.5px] font-semibold uppercase tracking-[0.12em] mb-3">
              What are you looking for?
            </p>
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3.5 stagger-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-[#EDE3D2] shadow-[0_2px_10px_rgba(10,23,29,0.07)] hover:shadow-[0_8px_28px_rgba(10,23,29,0.13)] hover:border-oceanic/20 hover:-translate-y-1.5 transition-all duration-200 cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${cat.color}`}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {cat.icon}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-[12.5px] font-bold text-onyx group-hover:text-oceanic transition-colors leading-tight">
                    {cat.name}
                  </p>
                  <p className="text-[10.5px] text-onyx/35 font-medium mt-0.5">
                    {cat.count.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ═════════════════════════════════ */}
      <section className="py-24 px-5 sm:px-7 lg:px-8 bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-oceanic/55 text-[12.5px] font-semibold uppercase tracking-[0.12em] mb-2">
                This Week&apos;s Picks
              </p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link
              href="/shop"
              className="btn-ghost hidden sm:inline-flex h-11 px-5"
            >
              View all{" "}
              <span className="material-symbols-outlined text-[17px]">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-grid">
            {FEATURED.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link href="/shop" className="btn-secondary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ══ PROMO BANNER ══════════════════════════════════════ */}
      <section className="px-5 sm:px-7 lg:px-8 py-6 bg-wheat">
        <div className="max-w-[1280px] mx-auto">
          <div
            className="rounded-3xl overflow-hidden relative flex flex-col sm:flex-row items-center justify-between gap-8 px-10 py-10 min-h-[160px]"
            style={{
              background:
                "linear-gradient(135deg,#003F47 0%,#005566 60%,#007A8F 100%)",
            }}
          >
            <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-white/[0.04] -translate-y-1/3 translate-x-1/3" />
            <div className="absolute right-20 bottom-0 w-40 h-40 rounded-full bg-nectarine/[0.07] translate-y-1/3" />
            <div className="relative z-10">
              <p className="text-nectarine text-[12px] font-semibold uppercase tracking-[0.1em] mb-2">
                Limited Time Offer
              </p>
              <h3
                className="text-3xl font-black text-white tracking-tight mb-2"
                style={{ fontFamily: "'Roboto Slab',sans-serif" }}
              >
                Up to 40% off
                <br />
                Digital Products
              </h3>
              <p className="text-white/55 text-sm">
                Use code{" "}
                <strong className="text-nectarine font-black">DIGITAL40</strong>{" "}
                at checkout
              </p>
            </div>
            <Link
              href="/shop?category=digital-goods"
              className="relative z-10 shrink-0 btn-primary px-8 h-12"
            >
              Shop Digital{" "}
              <span className="material-symbols-outlined text-[17px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════ */}
      <section
        className="py-24 px-5 sm:px-7 lg:px-8"
        style={{
          background:
            "linear-gradient(160deg,#060E11 0%,#0A171D 50%,#13232C 100%)",
        }}
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-nectarine/60 text-[12.5px] font-semibold uppercase tracking-[0.12em] mb-3">
              Simple process
            </p>
            <h2
              className="text-[clamp(26px,4vw,42px)] font-black text-white tracking-[-0.025em] mb-3"
              style={{ fontFamily: "'Roboto Slab',sans-serif" }}
            >
              How It Works
            </h2>
            <p className="text-white/40 max-w-md mx-auto text-[15px]">
              From discovery to doorstep in 4 simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-grid">
            {HOW.map((step, i) => (
              <div
                key={i}
                className="card-glass rounded-2xl p-7 relative group hover:bg-white/[0.10] transition-all duration-300"
              >
                <span
                  className="absolute top-5 right-6 text-[52px] font-black leading-none text-white/[0.04] select-none"
                  style={{ fontFamily: "'Roboto Slab',sans-serif" }}
                >
                  {step.step}
                </span>
                <div className="w-14 h-14 rounded-[16px] bg-oceanic flex items-center justify-center mb-5 shadow-oceanic group-hover:scale-105 transition-transform duration-200">
                  <span className="material-symbols-outlined text-wheat text-[26px]">
                    {step.icon}
                  </span>
                </div>
                <h3
                  className="font-black text-white text-lg mb-2 tracking-tight"
                  style={{ fontFamily: "'Roboto Slab',sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-white/45 text-[13.5px] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════ */}
      <section className="py-24 px-5 sm:px-7 lg:px-8 bg-wheat">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-oceanic/55 text-[12.5px] font-semibold uppercase tracking-[0.12em] mb-3">
              Social Proof
            </p>
            <h2 className="section-title">Loved by Shoppers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card-lift p-7">
                <div className="flex gap-0.5 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`material-symbols-outlined text-[16px] ${s <= t.stars ? "text-nectarine material-symbols-filled" : "text-onyx/12"}`}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="text-[14px] text-onyx/65 leading-relaxed mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-5 border-t border-[#EDE3D2]">
                  <div className="w-11 h-11 rounded-[12px] bg-oceanic flex items-center justify-center font-black text-wheat text-[15px] flex-shrink-0 shadow-oceanic">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-onyx text-[14px]">{t.name}</p>
                    <p className="text-onyx/40 text-[12px] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[12px] text-emerald-500 material-symbols-filled">
                        verified
                      </span>
                      Verified Buyer · {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ NEWSLETTER CTA ════════════════════════════════════ */}
      <section className="py-24 px-5 sm:px-7 lg:px-8 bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div
            className="rounded-[28px] overflow-hidden relative text-center px-8 py-20"
            style={{
              background:
                "radial-gradient(ellipse 90% 70% at 50% 100%,rgba(0,85,102,0.22) 0%,transparent 60%),linear-gradient(160deg,#003F47 0%,#005566 100%)",
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-nectarine/[0.10] blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-white/[0.04] blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-nectarine/15 border border-nectarine/25 mb-6 mx-auto">
                <span className="material-symbols-outlined text-nectarine text-[28px]">
                  mark_email_read
                </span>
              </div>
              <h2
                className="text-[clamp(28px,5vw,52px)] font-black text-white tracking-[-0.03em] mb-3 leading-tight"
                style={{ fontFamily: "'Roboto Slab',sans-serif" }}
              >
                Stay ahead of the deals
              </h2>
              <p className="text-white/50 text-[15px] mb-10 max-w-lg mx-auto">
                Join <strong className="text-white/80">2 million+</strong>{" "}
                shoppers receiving exclusive deals, new arrivals, and buying
                guides every week.
              </p>

              {/* onSubmit works here because 'use client' is the first line of this file */}
              <form
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                onSubmit={handleSubmit}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-5 rounded-[13px] bg-white/[0.10] border border-white/[0.15] text-white text-[14px] placeholder:text-white/35 focus:outline-none focus:border-nectarine/60 focus:bg-white/[0.14] transition-all"
                  style={{ height: "52px" }}
                />
                <button
                  type="submit"
                  className="btn-primary px-8 whitespace-nowrap shrink-0"
                  style={{ height: "52px" }}
                >
                  Subscribe Free
                </button>
              </form>

              <p className="text-white/28 text-[12px] mt-4 font-medium">
                No spam · Unsubscribe anytime · 100% free
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
